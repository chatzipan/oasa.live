const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:00$/

const isDateFormat = str => dateRegex.test(str)

function median(values) {
  values.sort(function(a, b) {
    return a - b
  })

  if (values.length === 0) return 0

  const half = Math.floor(values.length / 2)

  if (values.length % 2) return values[half]
  else return (values[half - 1] + values[half]) / 2.0
}

module.exports = {
  isDateFormat,
  median,
}
