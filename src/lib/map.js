import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'

import createImage from './create-image'
import mapConfig from '../config/map'
import track from './track'
import * as images from '../assets/images'

mapboxgl.accessToken = mapConfig.TOKEN

const emptyCollection = {
  type: 'FeatureCollection',
  features: [],
}

function loadIcons() {
  const loadIcon = ([name, dataUri]) =>
    createImage(dataUri).then(image => ({
      name,
      image,
    }))

  return Promise.all(Object.entries(images).map(loadIcon))
}

export const setStopsLabelName = language =>
  language === 'gr'
    ? '{descr}'
    : [
        'case',
        ['==', ['get', 'descr_en'], null],
        ['get', 'descr'],
        ['get', 'descr_en'],
      ]

/**
 * Click handler for the map.
 * @param  {Event} event  The mapbox-gl click event
 * @param  {mapboxgl.Map} map  The map instance //TODO: pass only props
 */
export function addMapLayers(map, props) {
  return new Promise((resolve, reject) => {
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

    // Stops
    map.addSource(mapConfig.STOPS_SOURCE_ID, {
      type: 'geojson',
      data: emptyCollection,
    })

    map.addLayer({
      source: mapConfig.STOPS_SOURCE_ID,
      id: mapConfig.STOPS_LAYER_ID,
      type: 'circle',
      minzoom: mapConfig.SYMBOL_MIN_ZOOM,
      paint: {
        'circle-color': { type: 'identity', property: 'color' },
        'circle-stroke-width': { type: 'identity', property: 'strokeWidth' },
        'circle-stroke-color': { type: 'identity', property: 'strokeColor' },
        'circle-radius': { type: 'identity', property: 'radius' },
        'circle-opacity': { type: 'identity', property: 'opacity' },
        'circle-stroke-opacity': { type: 'identity', property: 'opacity' },
      },
    })

    // Stop labels
    map.addLayer({
      source: mapConfig.STOPS_SOURCE_ID,
      id: mapConfig.STOPS_LABEL_LAYER_ID,
      minzoom: mapConfig.SYMBOL_MIN_ZOOM + 1,
      type: 'symbol',
      layout: {
        'text-field': setStopsLabelName(props.language),
        'text-anchor': 'top',
        'text-offset': [0, 0.5],
      },
      paint: {
        'text-color': {
          type: 'identity',
          property: 'strokeColor',
        },
        'text-halo-color': '#00ad9f',
        'text-halo-width': 0,
        'text-opacity': { type: 'identity', property: 'opacity' },
      },
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
        'text-field': '{name}',
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

    // Geolocation Point
    map.addSource(mapConfig.GEOLOCATION_SOURCE_ID, {
      type: 'geojson',
      data: turf.featureCollection([]),
    })
    map.addLayer({
      type: 'circle',
      id: 'geo-location-halo-layer',
      source: mapConfig.GEOLOCATION_SOURCE_ID,
      paint: { 'circle-radius': 16, 'circle-color': 'rgba(0,255,185,0.24)' },
    })
    map.addLayer({
      type: 'circle',
      id: 'geo-location-circle-layer',
      source: mapConfig.GEOLOCATION_SOURCE_ID,
      paint: {
        'circle-color': '#00FFB9',
        'circle-radius': 6,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFF',
      },
    })

    // Selected Feature
    map.addSource(mapConfig.TRACK_LINE_SOURCE_ID, {
      type: 'geojson',
      data: emptyCollection,
    })

    map.on('click', event => {
      const selectedFeature = map.queryRenderedFeatures(event.point, {
        layers: [mapConfig.VEHICLE_LAYER_ID, mapConfig.STOPS_LAYER_ID],
      })
      const selected = selectedFeature[0]

      if (!selected) {
        track('clear_map', {
          event_category: 'click_on_map',
        })
      } else if (selected.properties.type === 'stop') {
        track('select_stop', {
          event_category: 'click_on_map',
          stop: selected.properties.descr,
        })
      } else if (selected.properties.type === 'bus') {
        track('select_bus', {
          event_category: 'click_on_map',
          line: selected.properties.name,
          descr: selected.properties.descr,
        })
      }

      props.selectFeature(selected || null)
      props.closeMenu()
    })

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
        map.setFilter(mapConfig.STOPS_LAYER_ID, ['!has', 'bearing'])
        map.setFilter(mapConfig.LABEL_LAYER_ID, ['!has', 'bearing'])
        map.setFilter(mapConfig.SHADOW_LAYER_ID, ['!has', 'bearing'])
        resolve(map)
      })
      .catch(error => {
        console.log({ error })
        reject(error)
      })
  })
}

export default function(container, props) {
  return new Promise((resolve, reject) => {
    const { isNightMode } = props
    const style = isNightMode ? mapConfig.STYLE_NIGHT_MODE : mapConfig.STYLE

    const map = new mapboxgl.Map({
      center: mapConfig.CENTER,
      zoom: mapConfig.ZOOM,
      container,
      style,
    })

    map.touchZoomRotate.disableRotation()

    map.on('load', async () => {
      await addMapLayers(map, props)
      resolve(map)
    })
  })
}
