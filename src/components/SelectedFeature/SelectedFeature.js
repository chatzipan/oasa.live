import React from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'

import getColors from '../../lib/get-colors'
import getAthensTime from '../../lib/get-athens-time'
import mapConfig from '../../config/map'

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
    secondsToLastPos: 0,
  }

  constructor(props) {
    super(props)
    const mapboxControlLeft = document.querySelector(
      '.mapboxgl-ctrl-bottom-left'
    )
    const mapboxControlRight = document.querySelector(
      '.mapboxgl-ctrl-bottom-right'
    )

    this.map = props.map
    this.mapboxControls = [mapboxControlLeft, mapboxControlRight]
    this.map.addSource(lineSourceId, { type: 'geojson', data: emptyCollection })
  }

  componentDidUpdate(prevProps) {
    const { selectedTrack } = this.props

    if (selectedTrack !== prevProps.selectedTrack) {
      clearInterval(this.interval)
      if (selectedTrack && selectedTrack.properties.type === '_bus') {
        this.showTrack()
        this.secondsToLastPos()
        this.interval = setInterval(this.secondsToLastPos, 1000)
      } else if (selectedTrack && selectedTrack.properties.type === 'stop') {
        this.fetchStopArrivals(selectedTrack.properties.code)
        this.clearTrack()
      } else {
        this.clearTrack()
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
    this.mapboxControls.forEach(control => {
      control.classList.remove('mapboxgl-ctrl--with-bottom-bar')
    })
  }

  getNextStop = () => {
    const {
      selectedTrack: {
        properties: { distanceCovered, routeCode, speed, timestamp },
      },
      stops,
    } = this.props
    const now = getAthensTime()
    const timeSpan = now - timestamp
    const diff = timeSpan * speed
    const distanceDriven = distanceCovered + diff
    const routeStops = stops[routeCode]
    const nextStop = routeStops.find(
      stop => stop.distanceFromStart > distanceDriven
    )

    return nextStop ? nextStop.descr : ''
  }
  /**
   * Fetches track data
   *
   * @return {Promise}  Resolves with the stop arrivals
   */
  fetchStopArrivals = async code => {
    const arrivals = await fetch(
      `/.netlify/functions/getStopArrivals?stopCode=${code}`
    ).then(response => response.json())
    this.setState({ arrivals })
  }

  /**
   * Renders the line layer for the track.
   * @param {string} color  The color the track should be rendered in
   */
  renderTrack(color) {
    const id = `${lineLayerId}-${color}`

    if (!this.layers.has(id)) {
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
    const localOffset = now.getTimezoneOffset()
    const athensOffset = -120
    const offsetDiff = localOffset - athensOffset
    now.setMinutes(now.getMinutes() + offsetDiff)

    const secondsToLastPos = Math.round((now.getTime() - timestamp) / 1000)
    this.setState({ secondsToLastPos })
  }

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
    this.mapboxControls.forEach(control => {
      control.classList.add('mapboxgl-ctrl--with-bottom-bar')
    })
  }

  timeToLastPosition = () => {
    const { secondsToLastPos } = this.state
    const minutes = Math.floor(secondsToLastPos / 60)
    const seconds = (secondsToLastPos % 60).toString().padStart(2, '0')

    return `${minutes}:${seconds} ago`
  }

  renderRouteInfo = () => {
    const { descr, name } = this.props.selectedTrack.properties

    return (
      <>
        <div className={styles.row}>
          <div className={styles.routeId}>
            <div className={styles.label}>Line</div>
            <div className={styles.value}>{name}</div>
          </div>
          <div className={styles.routeName}>
            <div className={styles.label}>Route</div>
            <div className={styles.value} title={descr}>
              {descr}
            </div>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.lastSeen}>
            <div className={styles.label}>Last Seen</div>
            <div className={styles.value}>{this.timeToLastPosition()}</div>
          </div>
          <div className={styles.destination}>
            <div className={styles.label}>Next Stop</div>
            <div className={styles.value} title={this.getNextStop()}>
              {this.getNextStop()}
            </div>
          </div>
        </div>
      </>
    )
  }

  /* eslint-disable camelcase */
  renderStopArrivals = () =>
    this.state.arrivals.map(({ route_code, veh_code, btime2 }, i) => {
      const { descr, line } = this.props.details[route_code]
      const { id } = this.props.lines[line]

      return (
        <div className={cx(styles.row, styles.value, styles.bus)} key={i}>
          <div className={styles.line}>{id}</div>
          <div className={styles.lineDescr} title={descr}>
            {descr}
          </div>
          <div className={styles.arrivalTime}>{`${btime2}'`}</div>
        </div>
      )
    })

  /* eslint-enable camelcase */
  renderStopInfo = () => {
    const { descr } = this.props.selectedTrack.properties
    const { arrivals } = this.state

    return (
      <div className={cx(styles.row, styles.stops)}>
        <div className={styles.stopName}>
          <div className={styles.label}>Stop Name</div>
          <div className={styles.value} title={descr}>
            {descr}
          </div>
        </div>
        <div className={styles.arrivals}>
          <div className={cx(styles.row, styles.label)}>
            <div className={styles.line}>Line</div>
            <div className={styles.lineDescr}>Name</div>
            <div className={styles.arrivalTime}>When</div>
          </div>
          <div className={styles.arrivalsTable}>
            {arrivals && this.renderStopArrivals()}
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { selectedTrack: selected } = this.props
    const classNames = cx(styles.bar, { [styles.hidden]: !selected })
    if (!selected) return <div className={classNames} />
    const { type } = this.props.selectedTrack.properties

    return (
      <div className={styles.bar}>
        {type === '_bus' ? this.renderRouteInfo() : this.renderStopInfo()}
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