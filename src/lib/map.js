import mapboxgl from 'mapbox-gl'

import createImage from './create-image'
// import iconConfig, { defaultIcon } from '../config/icons'
import mapConfig from '../config/map'
import { selectTrack } from '../redux/selected-track'
import store from '../store'
import * as images from '../assets/images'

mapboxgl.accessToken = mapConfig.TOKEN

const emptyCollection = {
  type: 'FeatureCollection',
  features: [],
}

function loadIcons() {
  const loadIcon = ([name, dataUri]) => {
    return createImage(dataUri).then(image => ({
      name,
      image,
    }))
  }
  return Promise.all(Object.entries(images).map(loadIcon))
}

/**
 * Click handler for the map.
 * @param  {Event} event  The mapbox-gl click event
 * @param  {mapboxgl.Map} map  The map instance
 */
function onMapClick(event, map) {
  const features = map.queryRenderedFeatures(event.point, {
    layers: [mapConfig.VEHICLE_LAYER_ID],
  })

  store.dispatch(selectTrack(features[0] || null))
}

export default function(container, onLoad) {
  const map = new mapboxgl.Map({
    center: mapConfig.CENTER,
    zoom: mapConfig.ZOOM,
    container,
    style: mapConfig.STYLE,
  })

  map.touchZoomRotate.disableRotation()

  map.on('load', () => {
    // Line segments
    map.addSource(mapConfig.LINE_SOURCE_ID, {
      type: 'geojson',
      data: emptyCollection,
    })

    map.addLayer({
      source: mapConfig.LINE_SOURCE_ID,
      type: 'line',
      id: mapConfig.LINE_LAYER_ID,
      paint: { 'line-color': '#8f0' },
    })

    // Vehicle circles
    map.addSource(mapConfig.VEHICLE_SOURCE_ID, {
      type: 'geojson',
      data: emptyCollection,
    })
    map.addLayer({
      source: mapConfig.VEHICLE_SOURCE_ID,
      id: mapConfig.VEHICLE_LAYER_ID,
      type: 'circle',
      paint: {
        'circle-color': { type: 'identity', property: 'color' },
        'circle-stroke-width': { type: 'identity', property: 'strokeWidth' },
        'circle-stroke-color': { type: 'identity', property: 'strokeColor' },
        'circle-radius': mapConfig.CIRCLE_RADIUS,
        'circle-opacity': { type: 'identity', property: 'opacity' },
        'circle-stroke-opacity': { type: 'identity', property: 'opacity' },
      },
    })

    // Circle shadows
    map.addLayer(
      {
        source: mapConfig.VEHICLE_SOURCE_ID,
        id: mapConfig.SHADOW_LAYER_ID,
        type: 'circle',
        paint: {
          'circle-radius': {
            stops: mapConfig.CIRCLE_RADIUS.stops.map(stop => [
              stop[0],
              stop[1] + 4,
            ]),
          },
          'circle-blur': 0.5,
          'circle-opacity': 0.5,
        },
      },
      mapConfig.VEHICLE_LAYER_ID
    )

    // Vehicle labels
    map.addLayer({
      source: mapConfig.VEHICLE_SOURCE_ID,
      id: mapConfig.LABEL_LAYER_ID,
      minzoom: mapConfig.SYMBOL_MIN_ZOOM,
      type: 'symbol',
      layout: {
        'text-field': '{routeName}',
        'text-anchor': 'top',
        'text-offset': [0, 0.75],
      },
      paint: {
        'text-color': {
          type: 'identity',
          property: 'color',
        },
        'text-halo-color': '#212121',
        'text-halo-width': 1,
        'text-opacity': { type: 'identity', property: 'opacity' },
      },
    })

    map.on('click', event => onMapClick(event, map))

    loadIcons()
      .then(icons => {
        icons.forEach(icon => map.addImage(icon.name, icon.image))

        map.addLayer({
          source: mapConfig.VEHICLE_SOURCE_ID,
          id: mapConfig.SELECTED_LAYER_ID,
          type: 'symbol',
          layout: {
            'icon-image': {
              type: 'identity',
              property: 'icon',
            },
            'icon-allow-overlap': true,
            'icon-rotate': {
              type: 'identity',
              property: 'bearing',
            },
            'icon-size': 0.5,
          },
        })
        map.setFilter(mapConfig.SELECTED_LAYER_ID, ['has', 'bearing'])
        map.setFilter(mapConfig.VEHICLE_LAYER_ID, ['!has', 'bearing'])
        map.setFilter(mapConfig.LABEL_LAYER_ID, ['!has', 'bearing'])
        map.setFilter(mapConfig.SHADOW_LAYER_ID, ['!has', 'bearing'])

        onLoad(map)
      })
      .catch(error => console.log({ error }))

    return map
  })
}
