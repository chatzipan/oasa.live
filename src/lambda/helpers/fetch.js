const _fetch = require('isomorphic-fetch')

const fetch = async url => {
  try {
    const response = await withTimeout(_fetch(url), 1250)
    if (!response.ok) {
      console.log(response)
    }
    return await response.json()
  } catch (e) {
    console.log('URL:' + url, 'error: ', e)
    throw new Error(e)
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
