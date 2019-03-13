import { fetchFromS3 } from '../helpers/s3.js'

export async function handler(event, context) {
  try {
    const [
      _lines,
      _coordinates,
      _routeDetails,
    ] = await Promise.all([
      fetchFromS3('linesList.json'),
      fetchFromS3('routePaths.json'),
      fetchFromS3('routeList.json'),
      // fetchFromS3('routeStops.json'),
    ])
    const lines = JSON.parse(_lines)
    const coordinates = JSON.parse(_coordinates)
    const routeDetails = JSON.parse(_routeDetails)

    return {
      statusCode: 200,
      body: JSON.stringify({ coordinates, lines, routeDetails }),
    }
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }),
    }
  }
}
