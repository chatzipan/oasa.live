const { indexBy, flatten, prop, reject } = require('ramda')
const Promise = require('bluebird')

const logger = require('./helpers/logger')
const { fetch } = require('./helpers/fetch')
const { fetchFromS3, uploadToS3 } = require('./helpers/s3')
const { transformRoute } = require('./helpers/transform')
const { checkForDiff } = require('./helpers/diff')
const sleep = require('./helpers/sleep')
const { GET_ROUTES_BY_LINE } = require('./helpers/api')

const fetchRoutes = async () => {
  logger.log('Fetching routes.')
  logger.time('fetch routes')

  const linesList = JSON.parse(await fetchFromS3('linesList.json'))
  const routes = await Promise.map(
    Object.keys(linesList),
    async line => {
      const _routes = await fetch(`${GET_ROUTES_BY_LINE}${line}`)
      if (!_routes) {
        linesList[line].routes = null
        return null
      }

      _routes.forEach(({ RouteCode }) => {
        linesList[line].routes = linesList[line].routes || []
        linesList[line].routes.push(RouteCode)
      })
      return _routes
    },
    { concurrency: 1 }
  )
  const routeList = indexBy(prop('RouteCode'), reject(n => !n, flatten(routes)))

  Object.keys(routeList).forEach(route => {
    !routeList[route] && console.log(route)
    routeList[route] = transformRoute(routeList[route])
  })

  const diff = await checkForDiff('routeList.json', routeList)
  if (diff) {
    logger.log('Diff found: ', diff)
    await uploadToS3('routeList.json', routeList)
    logger.log('Updated routes successfully!')
  } else {
    logger.log('Skipping...')
  }

  await uploadToS3('linesList.json', linesList)
  logger.timeEnd('fetch routes')
  await sleep(10)
  return true
}

module.exports = fetchRoutes
