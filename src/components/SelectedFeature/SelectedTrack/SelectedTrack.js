import React from 'react'
import { connect } from 'react-redux'

import getColors from '../../../lib/get-colors'
import mapConfig from '../../../config/map'

import translations from '../../../../translations'

import styles from './SelectedTrack.module.css'

const emptyCollection = {
  type: 'FeatureCollection',
  features: [],
}

const lineSourceId = mapConfig.TRACK_LINE_SOURCE_ID
const lineLayerId = mapConfig.TRACK_LINE_LAYER_ID
const beforeLayer = mapConfig.SHADOW_LAYER_ID

class SelectedTrack extends React.Component {
  /**
   * @prop {string|null} currentLayerId  The id of the currently active track
   *  layer
   */
  currentLayerId = null
  /**
   * @prop {Set<string>} layers  The set of available track layers
   */
  layers = new Set()

  constructor(props) {
    super(props)
    this.map = props.map
    this.state = {
      secondsToLastPos: this.getSecondsToLastPos(),
    }
    this.showTrack()
    this.secondsInterval = setInterval(this.updateSeondsToLastPos, 1000)
  }

  componentWillUnmount() {
    clearInterval(this.secondsInterval)
    this.clearTrack()
    this.map.removeLayer(this.currentLayerId)
  }

  componentDidUpdate(prevProps) {
    const { isNightMode, selected } = this.props

    if (isNightMode !== prevProps.isNightMode) {
      this.showTrack()
    }

    if (selected !== prevProps.selected) {
      clearInterval(this.secondsInterval)
      this.clearTrack()

      this.showTrack()
      this.updateSeondsToLastPos()
      this.secondsInterval = setInterval(this.updateSeondsToLastPos, 1000)
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
      language,
      selected: {
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

    return nextStop ? { gr: nextStop.d, en: nextStop.d_en }[language] : ''
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

  getSecondsToLastPos = () => {
    const { timestamp } = this.props.selected.properties
    const now = new Date()

    return Math.round((now.getTime() - timestamp) / 1000)
  }

  updateSeondsToLastPos = () => {
    const secondsToLastPos = this.getSecondsToLastPos()
    this.setState({ secondsToLastPos })
  }

  isGreek = () => this.props.language === 'gr'

  /**
   * Updates the selected journey track.
   * @param  {object} properties  Properties of the selected feature
   */
  showTrack() {
    const {
      coordinates,
      selected: { properties },
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
    const { language } = this.props
    const t = translations[language]
    const { secondsToLastPos } = this.state
    const minutes = Math.floor(secondsToLastPos / 60)
    const seconds = (secondsToLastPos % 60).toString().padStart(2, '0')
    const ago = t['AGO']
    const copy =
      language === 'en'
        ? `${minutes}:${seconds} ${ago}`
        : `${ago} ${minutes}:${seconds}`

    return copy
  }

  render = () => {
    const t = translations[this.props.language]
    const { descr, descrEn, name } = this.props.selected.properties
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
}

const mapStateToProps = ({
  routes: { coordinates, details, lines, routeStops },
  ui: { isNightMode, language },
}) => ({
  coordinates,
  details,
  isNightMode,
  language,
  lines,
  stops: routeStops,
})

export default connect(
  mapStateToProps,
  null
)(SelectedTrack)
