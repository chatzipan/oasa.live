const fetchLines = require('./fetchLines.js')
const fetchRoutes = require('./fetchRoutes.js')
const fetchLineSchedules = require('./fetchLineSchedules.js')
const fetchRouteDetails = require('./fetchRouteDetails.js')

const fetchStatic = async () => {
  try {
    console.log('Fetching route data from OASA API.')
    await fetchLines()
    await fetchLineSchedules()
    await fetchRoutes()
    await fetchRouteDetails()
  } catch (err) {
    console.log(err)
  }
}

;(async () => {
  await fetchStatic()
})()
