const Promise = require('bluebird')

const turf = require('@turf/helpers')
const lineSlice = require('@turf/line-slice')
const length = require('@turf/length').default

const { fetch } = require('./helpers/fetch')
const { fetchFromS3, uploadToS3 } = require('./helpers/s3')
const { GET_BUS_LOCATION } = require('./helpers/api')

const weekDays = [
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
  const day = weekDays.indexOf(_day)
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

const getRouteSpeed = (route, schedules, covered) => {
  const DEFAULT_SPEED = 35 / (60 * 60000) // 35 kmh
  const { distance, line, type } = route
  const scheduleType = routeTypeScheduleMap[type]
  const routeSchedules = schedules[line][scheduleType]
  if (covered < 0.05) return 0 // 50m of covered, consider still not started
  if (!routeSchedules) {
    // Bus could still get signal much after its last schedule
    return DEFAULT_SPEED
  }

  const routeCovered = covered / distance
  const now = new Date()
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

const fetchLocations = async () => {
  console.log('Fetching locations.')
  console.time('fetch locations time')
  const routes = new Set()
  const routeLocations = {}
  const [
    currentSchedules,
    _linesList,
    _coordinates,
    _routeDetails,
  ] = await Promise.all([
    getCurrentSchedules(),
    fetchFromS3('linesList.json'),
    fetchFromS3('routePaths.json'),
    fetchFromS3('routeList.json'),
  ])
  const coordinates = JSON.parse(_coordinates)
  const linesList = JSON.parse(_linesList)
  const routeDetails = JSON.parse(_routeDetails)

  Object.keys(currentSchedules).forEach(line => {
    const _routes = linesList[line].routes
    _routes.forEach(route => routes.add(route))
  })

  await Promise.map(
    [...routes],
    async route => {
      const locations = await fetch(`${GET_BUS_LOCATION}${route}`)
      if (locations) {
        locations.forEach(location => {
          const track = getFeature(coordinates[route])
          const current = {
            type: 'Point',
            coordinates: [
              parseFloat(location.CS_LNG),
              parseFloat(location.CS_LAT),
            ],
          }
          location.timestamp = Date.parse(
            location.CS_DATE.replace('PM', ' PM GMT+0200').replace(
              'AM',
              ' AM GMT+0200'
            )
          )
          const start = turf.point(track.geometry.coordinates[0])
          const sliced = lineSlice(start, current, track)
          const covered = length(sliced)
          const speed = getRouteSpeed(
            routeDetails[route],
            currentSchedules,
            covered
          )

          routeLocations[location['VEH_NO']] = {
            ...location,
            covered,
            speed,
          }
        })
      }
    },
    { concurrency: 5 }
  )

  await uploadToS3('routeLocations.json', routeLocations)
  console.timeEnd('fetch locations time')
  console.log('Updated route locations successfully!')
}

module.exports = fetchLocations
