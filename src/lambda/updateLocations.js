const fetchLocations = require('./fetchLocations.js')
const logger = require('./helpers/logger')

const fetchLive = async () => {
  await fetchLocations()
  logger.saveLogs()
}

;(async () => {
  await fetchLive()
})()
