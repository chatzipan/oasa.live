const diff = require('deep-diff').diff

const { checkFileExists, fetchFromS3 } = require('./s3.js')

const getDiffMsg = ({ kind, path, index, item, lhs, rhs }) => {
  const where = path && path.join(' - ')
  const msgs = {
    N: `Addetion in ${path}, value ${rhs}`,
    D: `Deleteion in ${path}, value ${lhs}`,
    E: `Edition in ${path}, new value "${rhs}" instead of old value "${lhs}"`,
    A: `Change in ${path}: ${item && getItemMsg(item)}`,
  }
  return msgs[kind]
}
const getItemMsg = ({ kind, item, lhs, rhs }) => {
  const msgs = {
    N: `New value ${rhs}`,
    D: `Deleted value ${lhs}`,
    E: `Edition new value "${rhs}" instead of old value "${lhs}"`,
  }
  return msgs[kind]
}

const getDiff = diffs => {
  let diffmsg = ''
  diffs.forEach(diff => {
    diffmsg += getDiffMsg(diff) + '\n'
  })
  return diffmsg
}

const checkForDiff = async (fileName, newData) => {
  if (checkFileExists(fileName)) {
    let linesDiff = null
    const previousData = JSON.parse(await fetchFromS3(fileName))

    linesDiff = diff(previousData, newData)

    if (linesDiff) {
      return getDiff(linesDiff)
    } else {
      console.log(`No update found for ${fileName} ...`)
    }
    return linesDiff
  } else {
    return null
  }
}

module.exports = {
  checkForDiff,
}
