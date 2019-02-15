import isMobile from './is-mobile'

const centerMobile = [23.729897, 37.972178]
const center = [23.729897, 37.972178]
const zoom = 14
const zoomMobile = 13
const radius = [[0, 0.5], [13, 6]]
const radiusMobile = [[10, 5], [12, 10], [15, 12]]
const symbolMinZoom = 14
const symbolMinZoomMobile = 13

const config = {
  TOKEN:
    'pk.eyJ1IjoidmNoYXR6aXBhbiIsImEiOiJjanEyd283djQxZDRqM3hwZG1temZycG9nIn0.oDOXX_UawW4lPyJ1bBWQew',
  STYLE: 'mapbox://styles/mapbox/dark-v9',

  VEHICLE_SOURCE_ID: 'vehicles-src',
  GEOLOCATION_SOURCE_ID: 'geo-location-source',

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
  SYMBOL_MIN_ZOOM: isMobile ? symbolMinZoomMobile : symbolMinZoom,

  CENTER: isMobile ? centerMobile : center,
  ZOOM: isMobile ? zoomMobile : zoom,
}

export default config
