const logger = require('./helpers/logger')
const fetchLines = require('./fetchLines')
const fetchRoutes = require('./fetchRoutes')
const fetchLineSchedules = require('./fetchLineSchedules')
const fetchRouteDetails = require('./fetchRouteDetails')
const email = require('./helpers/email')

const fetchStatic = async () => {
  try {
    logger.log('Fetching route data from OASA API.')
    await fetchLines()
    await fetchLineSchedules()
    await fetchRoutes()
    await fetchRouteDetails()
    await email(logger.printAll())
  } catch (err) {
    console.log(err)
  }
}

exports.handler = async event => {
  try {
    await fetchStatic()
  } catch (err) {
    logger.log(err)
  }
}
