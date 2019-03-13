const { fetch } = require('../helpers/fetch.js')
const { GET_STOP_ARRIVALS } = require('../api.js')

export async function handler(event, context) {
  try {
    const {
      queryStringParameters: { stopCode },
    } = event
    const arrivals = await fetch(`${GET_STOP_ARRIVALS}${stopCode}`)

    return {
      statusCode: 200,
      body: JSON.stringify(arrivals),
    }
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }),
    }
  }
}
