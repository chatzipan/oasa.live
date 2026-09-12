import React from 'react'
import { connect } from 'react-redux'

import translations from '../../../translations'
import track from '../../lib/track'
import { DONATION_URL, shouldShowDonation, snooze } from '../../lib/donation'

import styles from './DonationAsk.module.css'

// How long to wait after the arrivals render, so the ask does not compete
// with the thing the user actually came for.
const APPEAR_DELAY = 1500

// Tapping a second stop should not replay the delay or the animation.
let shownThisSession = false

/**
 * Records the click and lets the browser follow the link.
 *
 * Only a click from the stop card counts as having paid and quiets the ask.
 * The menu block is a permanent link that stays put however often it is used,
 * so opening it from there changes nothing.
 *
 * @param  {string} placement  Where the button was, for the analytics event
 */
function handleDonateClick(placement) {
  track('donate_click', {
    event_category: 'donation',
    event_label: placement,
  })
  if (placement === 'stop_card') {
    snooze('clicked')
  }
}

/**
 * The permanent block in the info menu. Never dismissed, never snoozed.
 */
export const DonationMenu = ({ t }) => (
  <div className={styles.menuAsk}>
    <p className={styles.menuText}>{t['DONATE_MENU_TEXT']}</p>
    <br />
    <a
      className={styles.donate}
      href={DONATION_URL}
      onClick={() => handleDonateClick('menu')}
      rel="noopener noreferrer"
      target="_blank"
    >
      {t['DONATE_BTN']}
    </a>
    <p className={styles.menuLink}>{DONATION_URL}</p>
  </div>
)

/**
 * The dismissible one-line ask inside the stop card.
 *
 * Mounted by SelectedStop only once real arrivals are on screen.
 */
class DonationAsk extends React.Component {
  timer = null
  state = {
    dismissed: false,
    visible: shownThisSession,
  }

  componentDidMount() {
    if (!shouldShowDonation()) return

    if (this.state.visible) return

    this.timer = setTimeout(() => {
      shownThisSession = true
      this.setState({ visible: true })
      track('donate_shown', {
        event_category: 'donation',
        event_label: 'stop_card',
      })
    }, APPEAR_DELAY)
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
  }

  handleDismiss = () => {
    track('donate_dismiss', {
      event_category: 'donation',
      event_label: 'stop_card',
    })
    snooze('dismissed')
    this.setState({ dismissed: true })
  }

  render = () => {
    const { dismissed, visible } = this.state
    if (!visible || dismissed || !shouldShowDonation()) return null

    const t = translations[this.props.language]

    return (
      <div className={styles.ask}>
        <div className={styles.text}>
          {t['DONATE_CARD_TEXT']}
          <span className={styles.signature}>{t['DONATE_CARD_SIGN']}</span>
        </div>
        <a
          className={styles.donate}
          href={DONATION_URL}
          onClick={() => handleDonateClick('stop_card')}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t['DONATE_BTN']}
        </a>
        <button
          aria-label={t['DONATE_DISMISS']}
          className={styles.dismiss}
          onClick={this.handleDismiss}
          title={t['DONATE_DISMISS']}
        >
          &times;
        </button>
      </div>
    )
  }
}

const mapStateToProps = ({ ui: { language } }) => ({ language })

export default connect(mapStateToProps, null)(DonationAsk)
