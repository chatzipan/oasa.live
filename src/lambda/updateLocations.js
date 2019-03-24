const fetchLocations = require('./fetchLocations')

exports.handler = async event => {
  try {
    await fetchLocations()
  } catch (err) {
    console.log(err)
  }
}
