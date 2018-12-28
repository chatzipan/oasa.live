import * as turf from '@turf/turf'
// import deepEqual from 'deep-equal'

import isMobile from '../config/is-mobile'

// import store from '../store'
// import { updateUserPosition } from '../redux/user-position'
// import selectPosition from '../selectors/select-position'

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
export default class GeoLocation {
  /**
   * Create the GeoLocation instance.
   * @param  {mapbox.Map} map  The map instance
   */
  constructor(map) {
    this.map = map

    this.sourceId = 'geo-location-source'

    this.map.addSource(this.sourceId, {
      type: 'geojson',
      data: turf.featureCollection([]),
    })
    this.map.addLayer({
      type: 'circle',
      id: 'geo-location-halo-layer',
      source: this.sourceId,
      paint: { 'circle-radius': 16, 'circle-color': 'rgba(0,255,185,0.24)' },
    })
    this.map.addLayer({
      type: 'circle',
      id: 'geo-location-circle-layer',
      source: this.sourceId,
      paint: {
        'circle-color': '#00FFB9',
        'circle-radius': 6,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFF',
      },
    })

    const button = document.querySelector('.geo-location-button')

    button.addEventListener('click', this.refresh.bind(this))
    // store.subscribe(this.onPositionChange.bind(this))
  }

  // /**
  //  * Handler for position state changes.
  //  */
  // onPositionChange() {
  //   // const userPosition = selectPosition(store.getState())
  //   const userPosition = {}

  //   if (deepEqual(userPosition, this.lastPosition)) {
  //     return
  //   }

  //   this.lastPosition = userPosition

  //   if (userPosition) {
  //     this.renderPosition(userPosition)
  //   }
  // }

  /**
   * Renders the user position and centers the map.
   * @param  {array} userPosition  The [lng, lat] position
   */
  renderPosition(userPosition) {
    const pointFeature = turf.point(userPosition)

    this.map
      .getSource(this.sourceId)
      .setData(turf.featureCollection([pointFeature]))

    const urlPosition = getPositionFromUrl()

    if (isMobile && !urlPosition) {
      this.map.setCenter(userPosition)
    } else if (urlPosition) {
      this.map.jumpTo(urlPosition)
    }
  }

  /**
   * Refreshes the user position.
   */
  refresh() {
    navigator.geolocation.getCurrentPosition(
      this.onPositionSuccess.bind(this),
      this.onPositionError.bind(this),
      { enableHighAccuracy: true }
    )
  }

  /**
   * Handler for successful position retrieval.
   * @param  {object} position  The geo position.
   */
  onPositionSuccess(position) {
    const { latitude, longitude } = position.coords
    console.log({ latitude, longitude })
    // store.dispatch(updateUserPosition([longitude, latitude]))
  }

  /**
   * Handler for unsuccessful position retrieval.
   * @param  {Error} positionError  The error
   */
  onPositionError(positionError) {
    console.error(positionError)
    // store.dispatch(updateUserPosition(null))
  }
}
