/**
 * The donation ask: where it points, and how long it stays quiet.
 *
 * Two independent snooze keys. Dismissing hides the ask for one month.
 * Clicking through is treated as having paid and hides it for three months.
 *
 * Safari deletes script-written localStorage after 7 days without a visit,
 * and private windows throw on access. Both fail open on purpose: if we
 * cannot read, the ask shows; if we cannot write, the snooze is forgotten.
 */

const DISMISSED_KEY = 'donationDismissedUntil'
const CLICKED_KEY = 'donationClickedUntil'

const MONTH = 30 * 24 * 60 * 60 * 1000
const DISMISS_MONTHS = 1
const CLICK_MONTHS = 3

export const DONATION_URL = 'https://revolut.me/v_chatzipanagiotis'

function read(key) {
  try {
    return window.localStorage.getItem(key)
  } catch (e) {
    return null
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch (e) {
    // private window, or storage is full — the snooze is simply not kept
  }
}

function isSnoozed(key) {
  const until = parseInt(read(key), 10)
  return !isNaN(until) && Date.now() < until
}

/**
 * Whether the ask may be shown at all.
 *
 * @return {boolean}
 */
export function shouldShowDonation() {
  if (typeof window === 'undefined') return false
  return !isSnoozed(DISMISSED_KEY) && !isSnoozed(CLICKED_KEY)
}

/**
 * Hides the ask for a while.
 *
 * @param  {string} reason  Either 'dismissed' or 'clicked'
 */
export function snooze(reason) {
  const key = reason === 'clicked' ? CLICKED_KEY : DISMISSED_KEY
  const months = reason === 'clicked' ? CLICK_MONTHS : DISMISS_MONTHS
  write(key, String(Date.now() + months * MONTH))
}
