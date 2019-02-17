const Promise = require('bluebird')

const { fetch } = require('../helpers/fetch.js')
const { checkForDiff } = require('../helpers/diff.js')
const sleep = require('../helpers/sleep.js')
const { uploadToS3 } = require('../helpers/s3.js')
const { transformLine } = require('../helpers/transform.js')
const { GET_LINES, GET_SCHEDULE_CODES_BY_LINE } = require('../api.js')

// We use proxy lines for some lines (such as deviations in case of sport events,
// farmer's markets) that don't have own schedules in database
const proxyLines = {
  1184: 833,
  1186: 994,
  1188: 1056,
  1190: 846,
  1196: 846,
  1195: 977,
}

const fetchLines = async () => {
  console.log('Fetching lines.')
  console.time('fetch lines and line schedule codes time')
  const lines = await fetch(GET_LINES)
  const linesList = lines.reduce((acc, line) => {
    acc[line.line_code] = transformLine(line)
    return acc
  }, {})

  await fetchLineScheduleCodes(linesList)
}

const fetchLineScheduleCodes = async linesList => {
  console.log('Fetching lines schedule codes')
  const scheduleCodes = {}

  await Promise.map(
    Object.keys(linesList),
    async line => {
      const lineCode = proxyLines[line] || line
      const schedules = await fetch(`${GET_SCHEDULE_CODES_BY_LINE}${lineCode}`)
      !schedules && console.log(linesList[line])
      linesList[line].sdcs = schedules.map(({ sdc_code }) => sdc_code) // eslint-disable-line  camelcase
      schedules.forEach(schedule => {
        scheduleCodes[schedule.sdc_code] = schedule
      })
    },
    { concurrency: 1 }
  )

  const diff = checkForDiff('scheduleCodes.json', scheduleCodes)
  if (diff) {
    console.log('Diff found: ', diff)
    await uploadToS3('scheduleCodes.json', scheduleCodes)
    await uploadToS3('linesList.json', linesList)
    console.log('Updated linesList and scheduleCodes successfully!')
  } else {
    console.log('Skipping...')
  }
  console.timeEnd('fetch lines and line schedule codes time')
  await sleep(5)
}

module.exports = fetchLines
