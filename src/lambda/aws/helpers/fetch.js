const _fetch = require('isomorphic-fetch')

const fetch = async url => {
  try {
    const response = await _fetch(url)
    if (!response.ok) {
      console.log(response) // output to netlify function log // NOT res.status >= 200 && res.status < 300
    }
    return await response.json()
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  fetch,
}
