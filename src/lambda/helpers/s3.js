const AWS = require('aws-sdk')

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'eu-central-1',
})

const s3 = new AWS.S3()
const Bucket = 'oasa'

const getSignedUrlPromise = (operation, params) =>
  new Promise((resolve, reject) => {
    s3.getSignedUrl(operation, params, (err, url) => {
      err ? reject(err) : resolve(url)
    })
  })

const checkFileExists = async Key => {
  try {
    const params = { Bucket, Key }
    await s3.headObject(params).promise()
    await getSignedUrlPromise('getObject', params)

    return true
  } catch (headErr) {
    console.log({ headErr })
    if (headErr.code === 'NotFound') {
      return false
    }
  }
}

const fetchFromS3 = async Key => {
  return new Promise((resolve, reject) => {
    s3.getObject({ Bucket, Key }, (err, data) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        resolve(data.Body.toString('utf-8'))
      }
    })
  })
}

const uploadToS3 = async (Key, data) => {
  return new Promise((resolve, reject) => {
    s3.putObject(
      {
        Bucket,
        Key,
        Body: JSON.stringify(data),
      },
      (err, data) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          resolve(data)
        }
      }
    )
  })
}

module.exports = {
  checkFileExists,
  fetchFromS3,
  uploadToS3,
}
