const Promise = require('bluebird')

const turf = require('@turf/helpers')
const lineSlice = require('@turf/line-slice')
const length = require('@turf/length').default

const logger = require('./helpers/logger')
const { fetch } = require('./helpers/fetch')
const { fetchFromS3, uploadToS3 } = require('./helpers/s3')
const { GET_BUS_LOCATION } = require('./helpers/api')

const DEFAULT_SPEED = 35 / (60 * 60000) // 35 kmh
const ROUTES_MEDIAN = 2162
const TIMESTAMP_THRESHOLD = 7 * 60 * 1000 // 7 minutes
const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const routeTypeScheduleMap = {
  1: 'go',
  2: 'come',
}

const getTimeInAthens = dateObj =>
  dateObj.toLocaleString('en-GB', {
    timeZone: 'Europe/Athens',
    hour12: false,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

const getDayParts = time => {
  const [_day, _hour] = time.split(' ')
  const [hour, minutes] = _hour.split(':')
  const day = WEEKDAYS.indexOf(_day)
  return { day, hour, minutes }
}
const getNextSchedule = (now, diff) => {
  const _time = new Date(now.getTime())
  _time.setHours(_time.getHours() + diff)
  const { day, hour } = getDayParts(getTimeInAthens(_time))

  return [day, hour]
}
const getRelevantSchedules = () => {
  const now = new Date()
  const timeInAthens = getTimeInAthens(now)
  const { day, hour, minutes } = getDayParts(timeInAthens)
  const schedules = [[day, hour]]

  schedules.push(getNextSchedule(now, -1))
  if (parseInt(minutes) > 56) schedules.push(getNextSchedule(now, 1))
  if (parseInt(minutes) < 30) schedules.push(getNextSchedule(now, -2))

  return schedules
}

const getCurrentSchedules = async () => {
  const relevantSchedules = getRelevantSchedules()
  const mergedSchedules = {}
  await Promise.all(
    relevantSchedules.map(async ([day, hour]) => {
      const url = `schedules/${day}_${hour}.json`
      const _schedules = JSON.parse(await fetchFromS3(url))
      Object.entries(_schedules).forEach(([line, sched]) => {
        if (sched.go) {
          mergedSchedules[line] = mergedSchedules[line] || {}
          mergedSchedules[line].go = mergedSchedules[line].go || []
          mergedSchedules[line].go = mergedSchedules[line].go.concat(sched.go)
        }

        if (sched.come) {
          mergedSchedules[line] = mergedSchedules[line] || {}
          mergedSchedules[line].come = mergedSchedules[line].come || []
          mergedSchedules[line].come = mergedSchedules[line].come.concat(
            sched.come
          )
        }
      })
      return Object.keys(_schedules)
    })
  )
  return mergedSchedules
}

const getFeature = coordinates => ({
  geometry: {
    type: 'LineString',
    coordinates,
  },
  properties: {},
  type: 'Feature',
})

const getRouteSpeed = (route, timestamp, schedules, covered) => {
  const { distance, line, type } = route
  const scheduleType = routeTypeScheduleMap[type]
  const routeSchedules = schedules[line][scheduleType]
  const now = new Date()

  if (now.getTime() - timestamp > TIMESTAMP_THRESHOLD) return 0 // Last signal > 7min ago, better show signal position
  if (covered < 0.05) return 0 // 50m of covered, consider still not started

  if (!routeSchedules) {
    // Bus could still get signal much after its last schedule
    return DEFAULT_SPEED
  }

  const routeCovered = covered / distance
  const { hour, minutes } = getDayParts(getTimeInAthens(now))
  const fractions = routeSchedules.map(({ start, end, duration }) => {
    const [_hour, _minutes] = start.split(':')

    const startYesterday = _hour === '23' && (hour === '00' || hour === '01')
    const diff =
      new Date(0, 0, 1, hour, minutes).getTime() -
      new Date(0, 0, startYesterday ? 0 : 1, _hour, _minutes).getTime()
    const fraction = diff / duration
    if (diff < 0) return 0

    if (fraction > 1) return 1
    return fraction
  })

  const diffs = fractions.map(fraction => Math.abs(fraction - routeCovered))
  const scheduleIndex = diffs.indexOf(Math.min(...diffs))
  const speed = distance / routeSchedules[scheduleIndex].duration
  return speed
}

const getRequestsFilter = route => {
  const isEvenMinute = new Date().getMinutes() % 2
  return isEvenMinute ? route > ROUTES_MEDIAN : route < ROUTES_MEDIAN
}
const fetchLocations = async () => {
  logger.log('Fetching locations.')
  logger.time('AWS: fetch locations time')
  let fetchErrors = 0
  let fetchSuccesses = 0
  const routes = new Set()
  const [
    currentSchedules,
    _linesList,
    _coordinates,
    _routeDetails,
    _routeLocations,
  ] = await Promise.all([
    getCurrentSchedules(),
    fetchFromS3('linesList.json'),
    fetchFromS3('routePaths.json'),
    fetchFromS3('routeList.json'),
    fetchFromS3('routeLocations.json'),
  ])
  const coordinates = JSON.parse(_coordinates)
  const linesList = JSON.parse(_linesList)
  const routeDetails = JSON.parse(_routeDetails)
  const routeLocations = JSON.parse(_routeLocations)

  Object.keys(currentSchedules).forEach(line => {
    const _routes = linesList[line].routes
    _routes.forEach(route => routes.add(route))
  })

  // Split requests into half, because OASA servers cannot take full burden at the moment
  const routesToFetch = [...routes].filter(getRequestsFilter)

  await Promise.map(
    routesToFetch,
    async route => {
      let locations = null
      try {
        locations = await fetch(`${GET_BUS_LOCATION}${route}`, true)
      } catch (e) {
        locations = null
        fetchErrors += 1
      }

      if (locations) {
        fetchSuccesses += 1
        locations.forEach(location => {
          const track = getFeature(coordinates[route])
          const current = {
            type: 'Point',
            coordinates: [
              parseFloat(location.CS_LNG),
              parseFloat(location.CS_LAT),
            ],
          }

          const timestamp = Date.parse(
            location.CS_DATE.replace('PM', ' PM GMT+0200').replace(
              'AM',
              ' AM GMT+0200'
            )
          )

          try {
            const start = turf.point(track.geometry.coordinates[0])
            const sliced = lineSlice(start, current, track)
            const covered = length(sliced)
            const speed = getRouteSpeed(
              routeDetails[route],
              timestamp,
              currentSchedules,
              covered
            )
            routeLocations[location['VEH_NO']] = {
              ...location,
              timestamp,
              covered,
              speed,
            }
          } catch (e) {
            logger.log(e)
          }
        })
      }
    },
    { concurrency: 5 }
  )

  await uploadToS3('routeLocations.json', routeLocations)
  logger.timeEnd('AWS: fetch locations time')
  logger.log('AWS: Total fetch errors: ' + fetchErrors)
  logger.log('AWS: Total fetch successes: ' + fetchSuccesses)
  logger.log('AWS: Total fetchs: ' + (fetchSuccesses + fetchErrors))
  logger.log('Updated route locations successfully!')
  return Promise.resolve()
}

module.exports = fetchLocations
