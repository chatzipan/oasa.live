const fs = require('fs')
const path = require('path')

function Logger() {
  this.stack = []
  this.timers = new Map()
}

Logger.prototype.log = function(msg) {
  const message = `${new Date()}: ${msg}`
  this.stack.push(message)
  console.log(message)
}

Logger.prototype.printAll = function() {
  const allLogs = this.stack.join('<br/><br/>')
  console.log('\n')
  console.log('Printing all logs...')
  console.log('\n')
  console.log(allLogs)
  return allLogs
}

Logger.prototype.saveLogs = function() {
  const allLogs = this.stack.join('\n')
  fs.writeFile(path.join(__dirname, '/../LOGS.txt'), allLogs, function(err) {
    if (err) throw err
    console.log('Saved LOGS!')
  })
}

Logger.prototype.time = function(msg) {
  this.timers.set(msg, Date.now())
  console.time(msg)
}

Logger.prototype.timeEnd = function(msg) {
  const diff = Date.now() - this.timers.get(msg)
  this.stack.push(`${new Date()}: ${msg}: ${diff}ms`)
  console.timeEnd(msg)
}

module.exports = new Logger()
