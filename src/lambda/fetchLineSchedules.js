const Promise = require('bluebird')
const setwith = require('lodash.setwith')
const { hasPath } = require('ramda')

const logger = require('./helpers/logger')
const { isDateFormat } = require('./helpers/utils')
const { fetch } = require('./helpers/fetch')
const { fetchFromS3, uploadToS3 } = require('./helpers/s3')
const sleep = require('./helpers/sleep')
const { GET_SCHEDULES_BY_LINE } = require('./helpers/api')
const { scheduleWeekDays } = require('./constants')

const allSchedules = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} }

const getScheduleCombinations = schedules =>
  Object.keys(schedules).map(line =>
    schedules[line].sdcs.map(scheduleCode => [
      schedules[line].ml,
      scheduleCode,
      line,
    ])
  )

const getUploadCombinations = schedules =>
  Object.entries(schedules).map(([day, hours]) =>
    Object.keys(hours).map(hour => [day, hour])
  )

const getDuration = (start, end) =>
  new Date(end).getTime() - new Date(start).getTime()

const fetchLineSchedules = async () => {
  logger.log('Fetching line schedules')
  logger.time('fetch line schedules')

  const linesList = JSON.parse(await fetchFromS3('linesList.json'))
  const scheduleCombinations = getScheduleCombinations(linesList)
  const flattenedCombinations = [].concat(...scheduleCombinations)

  await Promise.map(
    flattenedCombinations,
    async ([mlCode, sdcCode, lineCode]) => {
      const weekDays = scheduleWeekDays[sdcCode]
      if (!weekDays) {
        logger.log(
          `Missing Weekday configuration for sdcCode: ${sdcCode}. mlCode: ${mlCode}, lineCode: ${lineCode}`
        )
        return false
      }

      const url = GET_SCHEDULES_BY_LINE.replace('mlCode', mlCode)
        .replace('sdcCode', sdcCode)
        .replace('lineCode', lineCode)

      try {
        const schedules = await fetch(url)

        ;['go', 'come'].forEach(op => {
          if (schedules[op].length) {
            schedules[op].forEach(
              /* eslint-disable no-alert, camelcase */
              ({ sde_start1, sde_end1, sde_start2, sde_end2 }) => {
                const start = op === 'go' ? sde_start1 : sde_start2
                const end = op === 'go' ? sde_end1 : sde_end2
                const duration = getDuration(start, end)
                /* eslint-enable no-alert, camelcase */
                if (!isDateFormat(start) || !isDateFormat(end)) {
                  throw new Error(
                    `Wrong date format ${start}, ${end} in ${url}`
                  )
                }

                const hour = start.slice(11, 13)
                weekDays.forEach(day => {
                  if (!hasPath([day, hour, lineCode, op], allSchedules)) {
                    setwith(allSchedules, [day, hour, lineCode, op], [], Object)
                  }
                  allSchedules[day][hour][lineCode][op].push({
                    start: start.slice(11, 16),
                    end: end.slice(11, 16),
                    duration,
                  })
                })
              }
            )
          }
        })
      } catch (e) {
        logger.log('ERROR in fetchLineSchedules:', e)
      }
    },
    { concurrency: 5 }
  )

  const uploadCombinations = getUploadCombinations(allSchedules)
  await Promise.map(
    [].concat(...uploadCombinations),
    async ([day, hour]) =>
      uploadToS3(`schedules/${day}_${hour}.json`, allSchedules[day][hour]),
    {
      concurrency: 5,
    }
  )
  logger.log('Updated line schedules successfully!')
  logger.timeEnd('fetch line schedules')
  await sleep(5)

  return Promise.resolve()
}

module.exports = fetchLineSchedules
