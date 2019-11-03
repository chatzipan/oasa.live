import React from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'

import translations from '../../../../translations'
import sleep from '../../../lambda/helpers/sleep'
import track from '../../../lib/track'
import NoConnectionIcon from '../../../assets/svgs/cloud_off.svg'
import RefreshIcon from '../../../assets/svgs/refresh.svg'

import styles from './SelectedStop.module.css'

const TOTAL_REFETCHES = 6

class SelectedStop extends React.Component {
  networkReFetchCounter = TOTAL_REFETCHES
  state = {
    arrivals: null,
    loading: false,
    networkError: false,
  }

  componentDidMount() {
    this.fetchStopArrivals()
  }

  componentDidUpdate(prevProps) {
    if (this.props.selected !== prevProps.selected) {
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
    // const oasaUrl = `https://ccyshwm5tj.execute-api.eu-central-1.amazonaws.com/default/fetchStopArrivals?stopCode=${stopCode}`
    const oasaUrl = `https://ccyshwm5tj.execute-api.eu-central-1.amazonaws.com/default/fetchStopArrivals?stopCode=${stopCode}`
    let arrivals = null
    this.setState({ loading: true, networkError: false })

    try {
      const response = await fetch(oasaUrl)
      if (!response.ok) {
        throw new Error(response.msg)
      }
      arrivals = await response.json()
    } catch (e) {
      // retry in case of heavy load on server
      if (this.networkReFetchCounter) {
        this.networkReFetchCounter -= 1
        await sleep(0.33)
        this.fetchStopArrivals()
        return
      } else {
        console.log('Error:', e)
        this.setState({ networkError: true })
      }
    }

    this.networkReFetchCounter = TOTAL_REFETCHES
    this.setState({ arrivals, loading: false })
  }

  getStopName = () => {
    const { descr, descr_en: descrEn } = this.props.selected.properties
    return this.isGreek() ? descr : descrEn !== 'null' ? descrEn : descr
  }

  isGreek = () => this.props.language === 'gr'

  renderLoading = () => {
    const { arrivals } = this.state
    const loadingRows = arrivals ? arrivals.length : 2

    return new Array(loadingRows).fill(0).map((__, i) => (
      <div className={cx(styles.row, styles.value, styles.bus)} key={i}>
        <div className={cx(styles.line, styles.loading)} />
        <div className={cx(styles.lineDescr, styles.loading)} />
        <div className={cx(styles.arrivalTime, styles.loading)} />
      </div>
    ))
  }

  handleRefresh = () => {
    track('select_stop', {
      event_category: 'click_on_map',
      stop: this.props.selected.properties.descr,
    })
    this.fetchStopArrivals()
  }

  renderNetworkError = () => {
    const { language } = this.props
    const t = translations[language]
    return (
      <div className={styles.networkError}>
        <NoConnectionIcon />
        <div>
          <button className={styles.btn} onClick={this.handleRefresh}>
            {t['ARRIVALS_NETWORK_ERROR']}
            <br />
            {t['ARRIVALS_NETWORK_ERROR_BTN']}
          </button>
        </div>
      </div>
    )
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
    const { arrivals, loading, networkError } = this.state
    const { language } = this.props
    const t = translations[language]

    return (
      <div className={cx(styles.row, styles.stops)}>
        <div className={styles.stopName}>
          <div className={styles.label}>{t['STOP_NAME']}</div>
          <div className={styles.value} title={this.getStopName()}>
            {this.getStopName()}
          </div>
          <button
            className={cx(styles.btn, styles.refresh)}
            onClick={this.handleRefresh}
          >
            <RefreshIcon />
            {t['REFRESH']}
          </button>
        </div>
        <div className={styles.arrivals}>
          <div className={cx(styles.row, styles.label)}>
            <div className={styles.line}>{t['LINE']}</div>
            <div className={styles.lineDescr}>{t['ROUTE']}</div>
            <div className={styles.arrivalTime}>{t['WHEN']}</div>
          </div>
          <div className={styles.arrivalsTable}>
            {networkError
              ? this.renderNetworkError()
              : loading
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
