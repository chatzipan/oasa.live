import { fetchFromS3 } from '../helpers/s3.js'

export async function handler(event, context) {
  try {
    const locations = JSON.parse(await fetchFromS3('routeLocations.json'))

    return {
      statusCode: 200,
      body: JSON.stringify(locations),
    }
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }),
    }
  }
}
