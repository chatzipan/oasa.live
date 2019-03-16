const sleep = waitTimeInSec => {
  console.log(`Waiting for ${waitTimeInSec} seconds...`)
  return new Promise(resolve => setTimeout(resolve, waitTimeInSec * 1000))
}

module.exports = sleep
