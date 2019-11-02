const fetchLocations = require('./fetchLocations.js')

const fetchLive = async () => {
  await fetchLocations()
}

;(async () => {
  await fetchLive()
})()
