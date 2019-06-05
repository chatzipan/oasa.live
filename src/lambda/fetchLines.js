const Promise = require('bluebird')

const logger = require('./helpers/logger')
const { fetch } = require('./helpers/fetch')
const { checkForDiff } = require('./helpers/diff')
const sleep = require('./helpers/sleep')
const { uploadToS3 } = require('./helpers/s3')
const { transformLine } = require('./helpers/transform')
const { GET_LINES, GET_SCHEDULE_CODES_BY_LINE } = require('./helpers/api')

// We use proxy lines for some lines (such as deviations in case of sport events,
// farmer's markets) that don't have own schedules in database
const proxyLines = {
  1184: 833,
  1186: 994,
  1188: 1056,
  1190: 846,
  1196: 846,
  1195: 977,
  1212: 914,
  1329: 1065,
  1330: 1065,
}

const fetchLines = async () => {
  logger.log('Fetching lines.')
  logger.time('fetch lines and line schedule codes time')
  const lines = await fetch(GET_LINES)
  const linesList = lines.reduce((acc, line) => {
    acc[line.line_code] = transformLine(line)
    return acc
  }, {})

  return fetchLineScheduleCodes(linesList)
}

const fetchLineScheduleCodes = async linesList => {
  logger.log('Fetching lines schedule codes')
  const scheduleCodes = {}

  await Promise.map(
    Object.keys(linesList),
    async line => {
      const lineCode = proxyLines[line] || line
      const schedules = await fetch(`${GET_SCHEDULE_CODES_BY_LINE}${lineCode}`)
      if (!schedules) {
        logger.log(JSON.stringify(linesList[line]))
        logger.log(`No Schedule for: ${GET_SCHEDULE_CODES_BY_LINE}${lineCode}`)
        return
      }

      linesList[line].sdcs = schedules.map(({ sdc_code }) => sdc_code) // eslint-disable-line  camelcase

      schedules.forEach(schedule => {
        scheduleCodes[schedule.sdc_code] = schedule
      })
    },
    { concurrency: 1 }
  )

  const diff = await checkForDiff('scheduleCodes.json', scheduleCodes)
  if (diff) {
    logger.log('Diff found: ', diff)
    await uploadToS3('scheduleCodes.json', scheduleCodes)
    await uploadToS3('linesList.json', linesList)
    logger.log('Updated linesList and scheduleCodes successfully!')
  } else {
    logger.log('Skipping...')
  }
  logger.timeEnd('fetch lines and line schedule codes time')
  await sleep(5)

  return true
}

module.exports = fetchLines
