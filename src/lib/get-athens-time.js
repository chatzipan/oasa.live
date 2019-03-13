export default function() {
  const now = new Date()
  const localOffset = now.getTimezoneOffset()
  const athensOffset = -120
  const offsetDiff = localOffset - athensOffset
  now.setMinutes(now.getMinutes() + offsetDiff)
  return now.getTime()
}
