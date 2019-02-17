import { fetchFromS3 } from '../helpers/s3.js'

export async function handler(event, context) {
  try {
    const lines = JSON.parse(await fetchFromS3('linesList.json'))
    const coordinates = JSON.parse(await fetchFromS3('routePaths.json'))
    const routeDetails = JSON.parse(await fetchFromS3('routeList.json'))

    const data = { coordinates, lines, routeDetails }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }),
    }
  }
}
