const { indexBy, flatten, prop, reject } = require('ramda')
const Promise = require('bluebird')
const { fetch } = require('../common/fetch.js')
const { fetchFromS3, uploadToS3 } = require('../common/s3.js')
const { transformRoute } = require('../common/transform.js')
const { checkForDiff } = require('../common/diff.js')
const sleep = require('../common/sleep.js')
const { GET_ROUTES_BY_LINE } = require('../api.js')

const fetchRoutes = async () => {
  console.log('Fetching routes.')
  console.time('fetch routes')

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
    console.log('Diff found: ', diff)
    await uploadToS3('routeList.json', routeList)
    console.log('Updated routes successfully!')
  } else {
    console.log('Skipping...')
  }

  await uploadToS3('linesList.json', linesList)
  console.timeEnd('fetch routes')
  await sleep(10)
  return true
}

module.exports = fetchRoutes
