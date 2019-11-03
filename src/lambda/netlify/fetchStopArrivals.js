const { fetch } = require('./fetch.js')

exports.handler = async (event, context) => {
  console.time('AWS: fetch stop arrivals time')
  try {
    const {
      queryStringParameters: { stopCode },
    } = event
    const arrivals = await fetch(
      `${process.env.GATSBY_STOP_API_URL}?stopCode=${stopCode}`
    )
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
