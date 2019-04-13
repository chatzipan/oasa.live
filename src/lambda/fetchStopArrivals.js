const { fetch } = require('./helpers/fetch.js')
const { GET_STOP_ARRIVALS } = require('./helpers/api.js')

exports.handler = async (event, context) => {
  console.time('AWS: fetch stop arrivals time')
  try {
    const {
      queryStringParameters: { stopCode },
    } = event
    const arrivals = await fetch(`${GET_STOP_ARRIVALS}${stopCode}`)
    console.timeEnd('AWS: fetch stop arrivals time')
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
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ msg: err.message }),
    }
  }
}
