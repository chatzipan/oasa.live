import * as turf from '@turf/turf'
import deepEqual from 'deep-equal'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import mapConfig from '../../config/map'
import { updateUserPosition } from '../../redux/user-position'
import selectPosition from '../../selectors/select-position'

import GeoLocationIcon from '../../assets/svgs/geolocation.svg'
import styles from './GeoLocation.module.css'

/**
 * Get map center and zoom from URL params.
 * @returns {Object|null} An object containing {lng, lat, zoom}.
 */
function getPositionFromUrl() {
  const params = new URL(document.location.href).searchParams
  const lng = params.get('lng')
  const lat = params.get('lat')
  const zoom = params.get('zoom')

  if (!lng || !lat || !zoom) {
    return null
  }

  return { lng, lat, zoom }
}

/**
 * The GeoLocation module. Managing the user position.
 */
class GeoLocation extends Component {
  /**
   * Create the GeoLocation instance.
   * @param  {mapbox.Map} map  The map instance
   */
  constructor(props) {
    super(props)
    this.map = props.map
    this.refresh()
  }

  componentDidUpdate(prevProps) {
    if (this.props.userPosition !== prevProps.userPosition) {
      this.onPositionChange()
    }
  }

  /**
   * Handler for position state changes.
   */
  onPositionChange = () => {
    const userPosition = this.props.userPosition

    if (deepEqual(userPosition, this.lastPosition)) {
      return
    }
    this.lastPosition = userPosition

    if (userPosition) {
      this.renderPosition(userPosition)
    }
  }

  /**
   * Handler for unsuccessful position retrieval.
   * @param  {Error} positionError  The error
   */
  onPositionError = positionError => {
    this.props.updateUserPosition(null)
  }

  /**
   * Handler for successful position retrieval.
   * @param  {object} position  The geo position.
   */
  onPositionSuccess = position => {
    const { latitude, longitude } = position.coords
    this.props.updateUserPosition([longitude, latitude])
  }

  refresh = () => {
    navigator.geolocation.getCurrentPosition(
      this.onPositionSuccess,
      this.onPositionError,
      { enableHighAccuracy: true }
    )
  }

  /**
   * Renders the user position and centers the map.
   * @param  {array} userPosition  The [lng, lat] position
   */
  renderPosition(userPosition) {
    const pointFeature = turf.point(userPosition)

    this.map
      .getSource(mapConfig.GEOLOCATION_SOURCE_ID)
      .setData(turf.featureCollection([pointFeature]))

    const urlPosition = getPositionFromUrl()

    if (!urlPosition) {
      this.map.setCenter(userPosition)
    } else {
      this.map.jumpTo(urlPosition)
    }
  }

  render() {
    return (
      <button className={styles.geoLocation} onClick={this.refresh}>
        <GeoLocationIcon />
      </button>
    )
  }
}

const mapStateToProps = state => ({
  userPosition: selectPosition(state),
})

export default connect(
  mapStateToProps,
  { updateUserPosition }
)(GeoLocation)
