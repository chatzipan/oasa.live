const fs = require('fs')
const path = require('path')
const node_fetch = require('node-fetch')
const { indexBy, flatten, prop } = require('ramda')
const Promise = require('bluebird')

const {
  GET_BUS_LOCATION,
  GET_LINES,
  GET_ROUTE_DETAILS,
  GET_ROUTES_PER_LINE,
} = require('./api.js')

const filepath = path.join(process.cwd(), 'src/lambda/data/')

const fetch = async url => {
  const response = await node_fetch(url)
  if (!response.ok) {
    console.log(err) // output to netlify function log // NOT res.status >= 200 && res.status < 300
  }
  return await response.json()
}

const write = async (path, data) => {
  await fs.promises.writeFile(path, data, {
    mode: 0o755,
  })
}

const fetchLines = async () => {
  console.log('Fetching lines.')

  const lines = await fetch(GET_LINES)
  write(`${filepath}lines.json`, JSON.stringify(lines))

  console.log('Updated lines successfully!')
}

const fetchRoutes = async () => {
  console.log('Fetching routes.')
  const lines = JSON.parse(fs.readFileSync(`${filepath}lines.json`, 'utf8'))

  const routes = await Promise.map(
    lines,
    async line => await fetch(`${GET_ROUTES_PER_LINE}${line.line_code}`),
    { concurrency: 2 }
  )

  const routeList = indexBy(prop('RouteCode'), flatten(routes))
  write(`${filepath}routes.json`, JSON.stringify(routeList))
  console.log('Updated routes successfully!')
}

const fetchRouteDetails = async () => {
  console.log('Fetching routes details')
  const routeList = JSON.parse(
    fs.readFileSync(`${filepath}routes.json`, 'utf8')
  )
  const routeDetails = {}
  await Promise.map(
    Object.keys(routeList),
    async route => {
      const { details, stops } = await fetch(`${GET_ROUTE_DETAILS}${route}`)
      routeDetails[route] = {
        coordinates: details.map(({ routed_x, routed_y }) => [
          parseFloat(routed_x),
          parseFloat(routed_y),
        ]),
        stops,
      }
    },
    { concurrency: 5 }
  )

  write(`${filepath}routeDetails.json`, JSON.stringify(routeDetails))
  console.log('Updated route details successfully!')
}

const fetchLocations = async () => {
  console.log('Fetching routes locations')
  const routeList = JSON.parse(
    fs.readFileSync(`${filepath}routes.json`, 'utf8')
  )
  const routeLocations = {}
  await Promise.map(
    Object.keys(routeList),
    async route => {
      const location = await fetch(`${GET_BUS_LOCATION}${route}`)
      if (location) {
        routeLocations[route] = location
      }
    },
    { concurrency: 5 }
  )

  write(`${filepath}locations.json`, JSON.stringify(routeLocations))
  console.log('Updated route locations successfully!')
}


;(async () => {
  try {
    console.log('Fetching route data from OASA API.')
    // await fetchLines()
    // await fetchRoutes()
    // await fetchRouteDetails()
    await fetchLocations()

  } catch (err) {
    console.log(err) // output to netlify function log
  }
})()
