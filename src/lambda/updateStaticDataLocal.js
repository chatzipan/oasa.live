require('dotenv').config()
const logger = require('./helpers/logger')
const fetchLines = require('./fetchLines')
const fetchRoutes = require('./fetchRoutes')
const fetchLineSchedules = require('./fetchLineSchedules')
const fetchRouteDetails = require('./fetchRouteDetails')

const fetchStatic = async () => {
  logger.log('Fetching route data from OASA API.')
  await fetchLines()
  await fetchLineSchedules()
  await fetchRoutes()
  await fetchRouteDetails()
}

;(async event => {
  try {
    await fetchStatic()
  } catch (err) {
    console.log('CAUGHT!: ', err)
    logger.log(err)
  }
})()
