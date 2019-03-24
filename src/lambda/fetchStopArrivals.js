const { fetch } = require('./helpers/fetch.js')
const { GET_STOP_ARRIVALS } = require('./helpers/api.js')

exports.handler = async (event, context) => {
  try {
    const {
      queryStringParameters: { stopCode },
    } = event
    const arrivals = await fetch(`${GET_STOP_ARRIVALS}${stopCode}`)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
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
