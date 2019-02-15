const Promise = require('bluebird')
const { flatten, uniq } = require('ramda')
const turf = require('@turf/helpers')
const lineSlice = require('@turf/line-slice')
const length = require('@turf/length').default

const { fetch } = require('../helpers/fetch.js')
const { fetchFromS3, uploadToS3 } = require('../helpers/s3.js')
const { GET_BUS_LOCATION } = require('../api.js')

const weekDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

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
  return [day, hour, minutes]
}

const getNextSchedule = (now, diff) => {
  const _time = new Date(now.getTime())
  _time.setHours(_time.getHours() + diff)
  const [day, hour] = getDayParts(getTimeInAthens(_time))

  return [day, hour]
}

const getRelevantSchedules = () => {
  const now = new Date()
  const timeInAthens = getTimeInAthens(now)
  const [day, hour, minutes] = getDayParts(timeInAthens)
  const schedules = [[day, hour]]

  schedules.push(getNextSchedule(now, -1))
  if (parseInt(minutes) > 56) schedules.push(getNextSchedule(now, 1))
  if (parseInt(minutes) < 30) schedules.push(getNextSchedule(now, -2))

  return schedules
}

const getActiveSchedules = async () => {
  const relevantSchedules = getRelevantSchedules()
  const schedules = await Promise.all(
    relevantSchedules.map(async ([day, hour]) => {
      const url = `schedules/${day}_${hour}.json`
      const _schedules = JSON.parse(await fetchFromS3(url))

      return Object.keys(_schedules)
    })
  )

  return uniq(flatten(schedules))
}

const getFeature = coordinates => ({
  geometry: {
    type: 'LineString',
    coordinates,
  },
  properties: {},
  type: 'Feature',
})

const fetchLocations = async () => {
  console.log('Fetching locations.')
  const schedules = await getActiveSchedules()
  const linesList = JSON.parse(await fetchFromS3('linesList.json'))
  const coordinates = JSON.parse(await fetchFromS3('routePaths.json'))
  const routes = new Set()
  const routeLocations = {}

  schedules.forEach(line => {
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
            location.CS_DATE.replace('PM', ' PM').replace('AM', ' AM')
          )
          const start = turf.point(track.geometry.coordinates[0])
          const sliced = lineSlice(start, current, track)
          const covered = length(sliced)

          routeLocations[location['VEH_NO']] = { ...location, covered }
        })
      }
    },
    { concurrency: 3 }
  )

  await uploadToS3('routeLocations.json', routeLocations)
  console.log('Updated route locations successfully!')
}

module.exports = fetchLocations
