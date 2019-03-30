require('dotenv').config()
const fetchLines = require('./fetchLines')
const fetchRoutes = require('./fetchRoutes')
const fetchLineSchedules = require('./fetchLineSchedules')
const fetchRouteDetails = require('./fetchRouteDetails')
const sleep = require('./helpers/sleep')
const email = require('./helpers/email')
const logger = require('./helpers/logger')

let failed = 0

const fetchStatic = async (_lines, _schedules, _routes, _details) => {
  let lines = _lines
  let schedules = _schedules
  let routes = _routes
  let details = _details

  try {
    logger.log('Fetching route data from OASA API.')
    lines = lines || (await fetchLines())
    schedules = schedules || (await fetchLineSchedules())
    routes = routes || (await fetchRoutes())
    details = details || (await fetchRouteDetails())
  } catch (err) {
    failed += 5
    logger.log(err)
    await sleep(failed)

    fetchStatic(lines, schedules, routes, details)
  }
  await email(logger.printAll())
}

;(async event => {
  try {
    await fetchStatic()
  } catch (err) {
    logger.log(err)
  }
})()
