function Logger() {
  this.stack = []
  this.timers = new Map()
}

Logger.prototype.log = function(msg) {
  this.stack.push(msg)
  console.log(msg)
}

Logger.prototype.printAll = function(msg) {
  console.log('\n')
  console.log('Printing all logs...')
  console.log('\n')
  console.log(this.stack.join('\n'))
}

Logger.prototype.time = function(msg) {
  this.timers.set(msg, Date.now())
  console.time(msg)
}

Logger.prototype.timeEnd = function(msg) {
  const diff = Date.now() - this.timers.get(msg)
  this.stack.push(`${msg}: ${diff}ms`)
  console.timeEnd(msg)
}

module.exports = new Logger()
