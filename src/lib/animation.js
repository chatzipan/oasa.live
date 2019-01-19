import mapConfig from '../config/map'

const featureCollection = {
  type: 'FeatureCollection',
  features: [],
}

const state = {
  animationId: -1,
  onData: null,
}

function requestAnimation(event, getPoints, map) {
  if (event.dataType === 'source') {
    map.getSource(mapConfig.VEHICLE_SOURCE_ID).off('data', state.onData)
    state.animationId = requestAnimationFrame(() => animate(getPoints, map))
  }
}

function cancelFrame(map) {
  map.getSource(mapConfig.VEHICLE_SOURCE_ID).off('data', state.onData)
  cancelAnimationFrame(state.animationId)
}

function animate(getPoints, map) {
  const source = map.getSource(mapConfig.VEHICLE_SOURCE_ID)
  // The `data` event fires when the source data was successfully updated,
  // this is when we want to queue up the next animation frame. This prevents
  // requesting frames when the last ones effects aren't done (rendered) yet.
  state.onData = event => requestAnimation(event, getPoints, map)
  source.on('data', state.onData)
  featureCollection.features = getPoints()
  source.setData(featureCollection)
}

export function startLoop(getPoints, map) {
  cancelFrame(map)
  animate(getPoints, map)
}
