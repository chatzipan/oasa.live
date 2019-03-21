import React from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'

import getColors from '../../lib/get-colors'
import mapConfig from '../../config/map'

import translations from '../../../translations'

import styles from './SelectedFeature.module.css'

const emptyCollection = {
  type: 'FeatureCollection',
  features: [],
}
const lineSourceId = mapConfig.TRACK_LINE_SOURCE_ID
const lineLayerId = mapConfig.TRACK_LINE_LAYER_ID
const beforeLayer = mapConfig.SHADOW_LAYER_ID

class SelectedFeature extends React.Component {
  /**
   * @prop {string|null} currentLayerId  The id of the currently active track
   *  layer
   */
  currentLayerId = null
  /**
   * @prop {Set<string>} layers  The set of available track layers
   */
  layers = new Set()

  state = {
    arrivals: null,
    loading: false,
    secondsToLastPos: 0,
  }

  constructor(props) {
    super(props)
    this.map = props.map
  }

  componentDidUpdate(prevProps) {
    const { isNightMode, selectedTrack } = this.props

    if (
      isNightMode !== prevProps.isNightMode &&
      selectedTrack &&
      selectedTrack.properties.type === 'bus'
    ) {
      this.showTrack()
    }

    if (selectedTrack !== prevProps.selectedTrack) {
      clearInterval(this.positionInterval)
      clearInterval(this.stopInterval)
      this.clearTrack()

      if (!selectedTrack) {
        return
      }

      switch (selectedTrack.properties.type) {
        case 'bus':
          this.showTrack()
          this.secondsToLastPos()
          this.positionInterval = setInterval(this.secondsToLastPos, 1000)
          break
        case 'stop':
          this.stopInterval = setInterval(this.fetchStopArrivals, 15000)
          this.fetchStopArrivals()
          break
      }
    }
  }

  /**
   * Clears the selected journey track.
   */
  clearTrack() {
    const source = this.map.getSource(lineSourceId)
    source.setData(emptyCollection)
    if (this.map.getLayer(beforeLayer)) {
      this.map.getLayer(beforeLayer).setLayoutProperty('visibility', 'visible')
    }
  }

  getNextStop = () => {
    const {
      lang,
      selectedTrack: {
        properties: { distanceCovered, routeCode, speed, timestamp },
      },
      stops,
    } = this.props
    const now = new Date().getTime()
    const timeSpan = now - timestamp
    const diff = timeSpan * speed
    const distanceDriven = distanceCovered + diff
    const routeStops = stops[routeCode]
    const nextStop = routeStops.find(stop => stop.dfs > distanceDriven)

    return nextStop ? { gr: nextStop.d, en: nextStop.d_en }[lang] : ''
  }
  /**
   * Fetches track data
   *
   * @return {Promise}  Resolves with the stop arrivals
   */
  fetchStopArrivals = async () => {
    const stopCode = this.props.selectedTrack.properties.code
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

  /**
   * Renders the line layer for the track.
   * @param {string} color  The color the track should be rendered in
   */
  renderTrack(color) {
    const id = `${lineLayerId}-${color}`
    if (!this.layers.has(id) || !this.map.getLayer(this.currentLayerId)) {
      this.map.addLayer(
        {
          source: lineSourceId,
          type: 'line',
          id,
          paint: { 'line-width': 3, 'line-color': color },
          layout: { visibility: 'none' },
        },
        beforeLayer
      )
      this.layers.add(id)
    }

    if (this.currentLayerId) {
      this.map
        .getLayer(this.currentLayerId)
        .setLayoutProperty('visibility', 'none')
    }

    this.map.getLayer(id).setLayoutProperty('visibility', 'visible')
    this.map.getLayer(beforeLayer).setLayoutProperty('visibility', 'none')
    this.currentLayerId = id
  }

  secondsToLastPos = () => {
    const { timestamp } = this.props.selectedTrack.properties
    const now = new Date()

    const secondsToLastPos = Math.round((now.getTime() - timestamp) / 1000)
    this.setState({ secondsToLastPos })
  }

  isGreek = () => this.props.lang === 'gr'

  /**
   * Updates the selected journey track.
   * @param  {object} properties  Properties of the selected feature
   */
  showTrack() {
    const {
      coordinates,
      selectedTrack: { properties },
    } = this.props

    if (!properties.routeCode) {
      return
    }

    const lineColor = getColors(properties, properties)
    const lineSource = this.map.getSource(lineSourceId)
    const geoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates[properties.routeCode],
          },
        },
      ],
    }

    lineSource.setData(geoJson)
    this.renderTrack(lineColor[0])
  }

  timeToLastPosition = () => {
    const { lang } = this.props
    const t = translations[lang]
    const { secondsToLastPos } = this.state
    const minutes = Math.floor(secondsToLastPos / 60)
    const seconds = (secondsToLastPos % 60).toString().padStart(2, '0')
    const ago = t['AGO']
    const copy =
      lang === 'en'
        ? `${minutes}:${seconds} ${ago}`
        : `${ago} ${minutes}:${seconds}`

    return copy
  }

  renderRouteInfo = t => {
    const { descr, descrEn, name } = this.props.selectedTrack.properties
    const nextStop = this.getNextStop()
    return (
      <>
        <div className={styles.row}>
          <div className={styles.routeId}>
            <div className={styles.label}>{t['LINE']}</div>
            <div className={styles.value}>{name}</div>
          </div>
          <div className={styles.routeName}>
            <div className={styles.label}>{t['ROUTE']}</div>
            <div className={styles.value} title={descr}>
              {this.isGreek() ? descr : descrEn}
            </div>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.lastSeen}>
            <div className={styles.label}>{t['LAST_SEEN']}</div>
            <div className={styles.value}>{this.timeToLastPosition()}</div>
          </div>
          <div className={styles.destination}>
            <div className={styles.label}>{t['NEXT_STOP']}</div>
            <div className={styles.value} title={nextStop}>
              {nextStop}
            </div>
          </div>
        </div>
      </>
    )
  }

  /* eslint-disable camelcase */
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
    this.state.arrivals.map(({ route_code, veh_code, btime2 }, i) => {
      const { descr, descr_en: descrEn, line } = this.props.details[route_code]
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

  /* eslint-enable camelcase */
  renderStopInfo = t => {
    const { descr, descr_en: descrEn } = this.props.selectedTrack.properties
    const { arrivals, loading } = this.state

    return (
      <div className={cx(styles.row, styles.stops)}>
        <div className={styles.stopName}>
          <div className={styles.label}>{t['STOP_NAME']}</div>
          <div className={styles.value} title={descr}>
            {this.isGreek() ? descr : descrEn}
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

  render() {
    const t = translations[this.props.lang]
    const { selectedTrack: selected } = this.props
    const classNames = cx(styles.bar, { [styles.hidden]: !selected })
    if (!selected) return <div className={classNames} />
    const { type } = this.props.selectedTrack.properties

    return (
      <div className={styles.bar}>
        {type === 'bus' ? this.renderRouteInfo(t) : this.renderStopInfo(t)}
      </div>
    )
  }
}

const mapStateToProps = ({
  routes: { coordinates, details, lines, routeStops },
  selectedTrack,
}) => ({
  coordinates,
  details,
  lines,
  selectedTrack,
  stops: routeStops,
})

export default connect(
  mapStateToProps,
  null
)(SelectedFeature)
