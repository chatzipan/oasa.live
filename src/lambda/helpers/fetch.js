const https = require('https')
const http = require('http')
const logger = require('./logger')

const request = url => {
  // return new pending promise
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = url.startsWith('https') ? https : http
    const request = lib.get(url, response => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(
          new Error('Failed to load page, status code: ' + response.statusCode)
        )
      }
      // temporary data holder
      const body = []
      // on every content chunk, push it to the data array
      response.on('data', chunk => body.push(chunk))
      // we are done, resolve promise with those joined chunks

      response.on('end', () => resolve(body.join('')))
    })
    // handle connection errors of the request
    request.on('error', err => reject(err))
  })
}

const fetch = async (url, timeout) => {
  try {
    const response = timeout
      ? await withTimeout(request(url), 8000)
      : await request(url)

    logger.log(' FETCHED! : URL:' + url)
    return await JSON.parse(response)
  } catch (e) {
    logger.log('ERROR! : URL:' + url, e)
    if (timeout) {
      throw new Error(e)
    }
  }
}

function withTimeout(promise, ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      reject(new Error('timeout'))
    }, ms)
    promise.then(resolve, reject)
  })
}

module.exports = {
  fetch,
}
