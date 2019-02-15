import React from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'

import getColors from '../../lib/get-colors'
import mapConfig from '../../config/map'

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
   * @prop {Set<string>} layers  The set of available track layers
   */
  layers = new Set()

  /**
   * @prop {string|null} currentLayerId  The id of the currently active track
   *  layer
   */
  currentLayerId = null

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
    if (this.props.selectedTrack !== prevProps.selectedTrack) {
      if (this.props.selectedTrack) {
        this.showTrack()
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

  /**
   * Updates the selected journey track.
   * @param  {object} properties  Properties of the selected feature
   */
  showTrack() {
    const {
      coordinates,
      selectedTrack: { properties },
    } = this.props

    if (!properties.journeyId) {
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
            coordinates: coordinates[properties.journeyId],
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

  render() {
    const { selectedTrack } = this.props
    const classNames = cx(styles.bar, {
      [styles.hidden]: !selectedTrack,
    })
    if (!selectedTrack) return <div className={classNames} />
    const { name, descr } = JSON.parse(selectedTrack.properties.details)

    return (
      <div className={classNames}>
        <div>
          <div className={styles.label}>Route</div>
          <div className={cx(styles.info, styles.infoRoute)}>{name}</div>
        </div>
        <div>
          <div className={cx(styles.label, styles.labelDestination)}>
            Next Destination
          </div>
          <div className={cx(styles.info, styles.infoDestination)}>{descr}</div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ routes: { coordinates }, selectedTrack }) => ({
  coordinates,
  selectedTrack,
})

export default connect(
  mapStateToProps,
  null
)(SelectedTrack)
