const fetchLocations = require('./fetchLocations.js')

const fetchLive = async () => {
  console.time('fetch locations time')
  await fetchLocations()
  console.timeEnd('fetch locations time')
}

;(async () => {
  await fetchLive()
  setInterval(fetchLive, 60 * 1000)
})()
