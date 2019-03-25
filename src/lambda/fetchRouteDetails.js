const Promise = require('bluebird')
const turf = require('@turf/helpers')
const lineSlice = require('@turf/line-slice')
const length = require('@turf/length').default

const { fetch } = require('./helpers/fetch')
const { transformStop } = require('./helpers/transform')
const { fetchFromS3, uploadToS3 } = require('./helpers/s3')
const { checkForDiff } = require('./helpers/diff')
const { GET_ROUTE_DETAILS } = require('./helpers/api')

const getDistanceFromStart = (stop, coordinates) => {
  const { lng, lat } = stop
  const path = {
    geometry: {
      type: 'LineString',
      coordinates,
    },
    properties: {},
    type: 'Feature',
  }
  const stopPoint = {
    type: 'Point',
    coordinates: [lng, lat],
  }
  const start = turf.point(coordinates[0])
  const sliced = lineSlice(start, stopPoint, path)
  const distanceFromStart = length(sliced)

  return {
    ...stop,
    dfs: distanceFromStart,
  }
}
const fetchRouteDetails = async () => {
  console.log('Fetching routes details')
  console.time('fetch route details')
  const routeList = JSON.parse(await fetchFromS3('routeList.json'))
  const routePaths = {}
  const routeStops = {}

  await Promise.map(
    Object.keys(routeList),
    async route => {
      const { details, stops } = await fetch(`${GET_ROUTE_DETAILS}${route}`)
      /* eslint-disable no-alert, camelcase */
      const routePath = details.map(({ routed_x, routed_y }) => [
        /* eslint-enable no-alert, camelcase */
        parseFloat(routed_x),
        parseFloat(routed_y),
      ])
      routePaths[route] = routePath
      routeStops[route] = stops
        .map(transformStop)
        .map(stop => getDistanceFromStart(stop, routePath))
        .sort((a, b) => a.dfs - b.dfs)
    },
    { concurrency: 1 }
  )
  const pathDiff = await checkForDiff('routePaths.json', routePaths)
  const stopsDiff = await checkForDiff('routeStops.json', routeStops)

  if (pathDiff) {
    await uploadToS3('routePaths.json', routePaths)
    console.log('Diff found: ', routePaths)
    console.log('Updated route paths successfully!')
  } else {
    console.log('Skipping...')
  }

  if (stopsDiff) {
    console.log('Diff found: ', stopsDiff)
    await uploadToS3('routeStops.json', routeStops)
    console.log('Updated route stops successfully!')
  } else {
    console.log('Skipping...')
  }

  console.timeEnd('fetch route details')
  return true
}

module.exports = fetchRouteDetails
