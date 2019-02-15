const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:00$/

const isDateFormat = str => dateRegex.test(str)

module.exports = {
  isDateFormat,
}
