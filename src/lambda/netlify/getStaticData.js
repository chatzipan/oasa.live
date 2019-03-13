// import { fetchFromS3 } from '../helpers/s3.js'

export async function handler(event, context) {
  try {
    console.log({
      AWS_ACCESS_KEYID: process.env.AWS_ACCESS_KEYID,
      AWS_SECRET_ACCESSKEY: process.env.AWS_SECRET_ACCESSKEY,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        _KEYID: process.env.AWS_ACCESS_KEYID,
        AWS_SECRET_ACCESSKEY: process.env.AWS_SECRET_ACCESSKEY,
      }),
    }
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }),
    }
  }
}
