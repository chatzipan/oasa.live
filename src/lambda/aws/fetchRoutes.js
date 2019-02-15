const { indexBy, flatten, prop } = require('ramda')
const Promise = require('bluebird')
const { fetch } = require('../helpers/fetch.js')
const { fetchFromS3, uploadToS3 } = require('../helpers/s3.js')
const { transformRoute } = require('../helpers/transform.js')
const { checkForDiff } = require('../helpers/diff.js')
const sleep = require('../helpers/sleep.js')
const { GET_ROUTES_BY_LINE } = require('../api.js')

const fetchRoutes = async () => {
  console.log('Fetching routes.')
  console.time('fetch routes')

  const linesList = JSON.parse(await fetchFromS3('linesList.json'))
  const routes = await Promise.map(
    Object.keys(linesList),
    async line => {
      const routes = await fetch(`${GET_ROUTES_BY_LINE}${line}`)
      routes.forEach(({ RouteCode }) => {
        linesList[line].routes = linesList[line].routes || []
        linesList[line].routes.push(RouteCode)
      })
      return routes
    },
    { concurrency: 1 }
  )

  const routeList = indexBy(prop('RouteCode'), flatten(routes))

  Object.keys(routeList).forEach(route => {
    routeList[route] = transformRoute(routeList[route])
  })

  const diff = checkForDiff('routeList.json', routeList)
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
}

module.exports = fetchRoutes
