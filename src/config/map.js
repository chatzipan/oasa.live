import isMobile from './is-mobile'

const centerMobile = [23.729897, 37.972178]
const center = [23.729897, 37.972178]
// const zoom = 16
const zoom = 14
const zoomMobile = 13
const radius = [[0, 0.5], [13, 6]]
const stopRadius = [[0, 0.5], [9, 4]]
const stopRadiusMobile = [[8, 4], [10, 7], [11, 8]]
const radiusMobile = [[12, 6], [12, 6], [14, 9]]
const symbolMinZoom = 15
const symbolMinZoomMobile = 14
const config = {
  TOKEN:
    'pk.eyJ1IjoidmNoYXR6aXBhbiIsImEiOiJjanEyd283djQxZDRqM3hwZG1temZycG9nIn0.oDOXX_UawW4lPyJ1bBWQew',
  STYLE_NIGHT_MODE: 'mapbox://styles/mapbox/dark-v9',
  STYLE: 'mapbox://styles/vchatzipan/cjsp550it1py21ftnadogfqv8', // light

  VEHICLE_SOURCE_ID: 'vehicles-src',
  STOPS_SOURCE_ID: 'stops-src',
  GEOLOCATION_SOURCE_ID: 'geo-location-source',

  STOPS_LAYER_ID: 'stops-layer',
  VEHICLE_LAYER_ID: 'vehicles-layer',
  SELECTED_LAYER_ID: 'selected-layer',
  LABEL_LAYER_ID: 'label-layer',

  LINE_SOURCE_ID: 'line-src',
  LINE_LAYER_ID: 'line-layer',

  TRACK_LINE_SOURCE_ID: 'track-line-src',
  TRACK_LINE_LAYER_ID: 'track-line-layer',

  SHADOW_LAYER_ID: 'shadow-layer',
  STATIONS_LAYER_ID: 'rail-station-label',
  CIRCLE_RADIUS: { stops: isMobile ? radiusMobile : radius },
  STOP_CIRCLE_RADIUS: { stops: isMobile ? stopRadiusMobile : stopRadius },
  SYMBOL_MIN_ZOOM: isMobile ? symbolMinZoomMobile : symbolMinZoom,

  CENTER: isMobile ? centerMobile : center,
  ZOOM: isMobile ? zoomMobile : zoom,
}

export default config
