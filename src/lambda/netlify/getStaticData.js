import { fetchFromS3 } from '../helpers/s3.js'

export async function handler(event, context) {
  try {
    const coordinates = JSON.parse(await fetchFromS3('routePaths.json'))
    const lines = JSON.parse(await fetchFromS3('lines.json'))
    const routeDetails = JSON.parse(await fetchFromS3('routeList.json'))

    const data = { coordinates, lines, routeDetails }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  } catch (err) {
    console.log(err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }), // Could be a custom message or object i.e. JSON.stringify(err)
    }
  }
}
