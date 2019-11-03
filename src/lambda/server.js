const http = require('http')
const port = 6349
const url = require('url')

const { fetch } = require('./helpers/fetch.js')
const { GET_STOP_ARRIVALS } = require('./helpers/api.js')

const requestHandler = async (request, response) => {
  console.time('AWS: fetch stop arrivals time')
  try {
    /* eslint-disable */
    const url_parts = url.parse(request.url, true)
    const { stopCode } = url_parts.query
    const arrivals = stopCode
      ? await fetch(`${GET_STOP_ARRIVALS}${stopCode}`)
      : null

    console.timeEnd('AWS: fetch stop arrivals time')
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.end(JSON.stringify(arrivals))
  } catch (err) {
    console.log(err)
    res.statusCode = 500
    res.write({ msg: err.message }) //write a response to the client
    res.end()
  }
}

const server = http.createServer(requestHandler)

server.listen(port, err => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})
