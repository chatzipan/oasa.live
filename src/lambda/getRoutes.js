import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { indexBy, flatten, prop } from 'ramda'
import Promise from 'bluebird'

import mock from './mock'
import { GET_BUS_LOCATION } from './api.js'

export async function handler(event, context) {
  try {
    const staticData = path.join(process.cwd(), 'src/lambda/routeDetails.json')
    const data = JSON.parse(fs.readFileSync(staticData, 'utf8'))

    await Promise.map(
      Object.keys(data),
      async route => {
        const response = await fetch(`${GET_BUS_LOCATION}${route}`)
        const location = await response.json()
        if (location) {
          data[route] = {
            ...data[route],
            location,
          }
        }
      },
      { concurrency: 5 }
    )

    mock.oasa = data

    return {
      statusCode: 200,
      body: JSON.stringify(mock),
    }
  } catch (err) {
    console.log(err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }), // Could be a custom message or object i.e. JSON.stringify(err)
    }
  }
}
