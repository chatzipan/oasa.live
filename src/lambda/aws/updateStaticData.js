const fetchLines = require('./fetchLines.js')
const fetchRoutes = require('./fetchRoutes.js')
const fetchLineSchedules = require('./fetchLineSchedules.js')
const fetchRouteDetails = require('./fetchRouteDetails.js')
const sleep = require('../helpers/sleep.js')

let failed = 0

const fetchStatic = async (_lines, _schedules, _routes, _details) => {
  let lines = _lines
  let schedules = _schedules
  let routes = _routes
  let details = _details

  try {
    console.log('Fetching route data from OASA API.')
    lines = lines || (await fetchLines())
    schedules = schedules || (await fetchLineSchedules())
    routes = routes || (await fetchRoutes())
    details = details || (await fetchRouteDetails())
  } catch (err) {
    failed += 5
    console.log(err)
    await sleep(failed)

    fetchStatic(lines, schedules, routes, details)
  }
}

;(async () => {
  await fetchStatic()
})()
