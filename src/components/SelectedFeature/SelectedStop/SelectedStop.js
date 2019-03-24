import React from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'

import translations from '../../../../translations'

import styles from './SelectedStop.module.css'

class SelectedStop extends React.Component {
  state = {
    arrivals: null,
    loading: false,
  }

  componentDidMount() {
    this.fetchStopArrivals()
    this.stopInterval = setInterval(this.fetchStopArrivals, 15000)
  }

  componentWillUnmount() {
    clearInterval(this.stopInterval)
  }
  componentDidUpdate(prevProps) {
    if (this.props.selected !== prevProps.selected) {
      clearInterval(this.stopInterval)
      this.stopInterval = setInterval(this.fetchStopArrivals, 15000)
      this.fetchStopArrivals()
    }
  }

  /**
   * Fetches track data
   *
   * @return {Promise}  Resolves with the stop arrivals
   */
  fetchStopArrivals = async () => {
    const stopCode = this.props.selected.properties.code
    const oasaUrl = `/.netlify/functions/getStopArrivals?stopCode=${stopCode}`
    let arrivals = null
    this.setState({ arrivals, loading: true })
    try {
      const response = await fetch(oasaUrl)

      if (!response.ok) {
        throw new Error(response.msg)
      }
      arrivals = await response.json()
    } catch (e) {
      console.log('Error:', e)
    }

    this.setState({ arrivals, loading: false })
  }

  secondsToLastPos = () => {
    const { timestamp } = this.props.selected.properties
    const now = new Date()

    const secondsToLastPos = Math.round((now.getTime() - timestamp) / 1000)
    this.setState({ secondsToLastPos })
  }

  isGreek = () => this.props.language === 'gr'

  renderLoading = () => {
    return [1, 2].map((line, i) => (
      <div className={cx(styles.row, styles.value, styles.bus)} key={i}>
        <div className={cx(styles.line, styles.loading)} />
        <div className={cx(styles.lineDescr, styles.loading)} />
        <div className={cx(styles.arrivalTime, styles.loading)} />
      </div>
    ))
  }

  renderStopArrivals = () =>
    this.state.arrivals.map(({ route_code: routeCode, btime2 }, i) => {
      const { descr, descr_en: descrEn, line } = this.props.details[routeCode]
      const { id } = this.props.lines[line]

      return (
        <div className={cx(styles.row, styles.value, styles.bus)} key={i}>
          <div className={cx(styles.line, styles.value)}>{id}</div>
          <div className={styles.lineDescr} title={descr}>
            {this.isGreek() ? descr : descrEn}
          </div>
          <div
            className={cx(styles.arrivalTime, styles.value)}
          >{`${btime2}'`}</div>
        </div>
      )
    })

  render = () => {
    const { arrivals, loading } = this.state
    const { language, selected } = this.props
    const t = translations[language]
    const { descr, descr_en: descrEn } = selected.properties
    const stopName = this.isGreek()
      ? descr
      : descrEn !== 'null'
      ? descrEn
      : descr

    return (
      <div className={cx(styles.row, styles.stops)}>
        <div className={styles.stopName}>
          <div className={styles.label}>{t['STOP_NAME']}</div>
          <div className={styles.value} title={descr}>
            {stopName}
          </div>
        </div>
        <div className={styles.arrivals}>
          <div className={cx(styles.row, styles.label)}>
            <div className={styles.line}>{t['LINE']}</div>
            <div className={styles.lineDescr}>{t['ROUTE']}</div>
            <div className={styles.arrivalTime}>{t['WHEN']}</div>
          </div>
          <div className={styles.arrivalsTable}>
            {loading
              ? this.renderLoading()
              : arrivals
              ? this.renderStopArrivals()
              : t['NO_ARRIVALS']}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ routes: { details, lines }, ui: { language } }) => ({
  details,
  language,
  lines,
})

export default connect(
  mapStateToProps,
  null
)(SelectedStop)
