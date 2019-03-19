import * as animation from './animation'
import PointGenerator from './point-generator'
import store from '../redux/store'
import mapConfig from '../config/map'
import isMobile from '../config/is-mobile'

const DEFAULT_INTERVAL = 20000
const locationsUrl =
  'https://s3.eu-central-1.amazonaws.com/oasa/routeLocations.json'

/**
 * Fetches track data
 *
 * @return {Promise}  Resolves with the track data
 */
function fetchTracks() {
  return fetch(locationsUrl).then(response => response.json())
}

/**
 * Manages tracks, refreshing data and restarting the animation loop.
 */
export default class TrackManager {
  lastRequestedTimes = {}
  timer

  /**
   * Constructor.
   * @param  {mapbox.Map} map  The map instance
   */
  constructor(map, { routes, fetchedLocations, selectFeature }) {
    this.map = map
    this.routes = routes
    this.fetchedLocations = fetchedLocations
    this.selectFeature = selectFeature
    this.pointGenerator = new PointGenerator()
  }

  /**
   * Transform an object of locations to a map point array
   * @param  {data} Object  The locations object
   */
  getPointData = data => {
    const { details, lines, coordinates } = this.routes

    return Object.entries(data).map(([vehicleNum, location]) => {
      const { CS_LAT, CS_LNG, ROUTE_CODE, speed, timestamp } = location
      const { descr, descr_en: descrEn, line } = details[ROUTE_CODE]

      return {
        currentLocation: {
          type: 'Point',
          coordinates: [parseFloat(CS_LNG), parseFloat(CS_LAT)],
        },
        delay: 2,
        descr,
        descrEn,
        distanceCovered: location.covered,
        id: vehicleNum,
        line: {
          geometry: {
            type: 'LineString',
            coordinates: coordinates[ROUTE_CODE],
          },
          properties: {},
          type: 'Feature',
        },
        name: lines[line].id,
        routeCode: ROUTE_CODE,
        routeName: details[ROUTE_CODE].line,
        speed,
        timestamp,
        type: 'bus',
      }
    })
  }

  getPointsInViewport = () => {
    const bounds = this.map.getBounds().toArray()
    return this.pointGenerator.getPoints(bounds)
  }

  /**
   * Handles a network error, resets the timer.
   * @param  {string} statusText  The response status text
   */
  handleError = statusText => {
    console.error('Failed to fetch tracks: ', statusText)
    this.setTimer()
  }

  /**
   * Processes a response.
   * @param  {object} data  The response data
   */
  processResponse = data => {
    this.updateSelectedTrack(data)
    const points = this.getPointData(data)
    this.setTimer()
    this.pointGenerator.clear().setTracks(Object.values(points))
    animation.startLoop(this.getPointsInViewport, this.map)
  }

  resumeAnimation = () => {
    animation.startLoop(this.getPointsInViewport, this.map)
  }

  /**
   * Refrehes the data.
   */
  fetchTracks = () =>
    fetchTracks()
      .then(this.processResponse)
      .catch(this.handleError)

  /**
   * Sets a timer for the data refreshal.
   * @param  {number} [timeout=DEFAULT_INTERVAL]  The timeout
   */
  setTimer(timeout = DEFAULT_INTERVAL) {
    if (this.timer) {
      clearTimeout(this.timer)
    }

    this.timer = setTimeout(this.fetchTracks, timeout)
  }

  renderStops = selectedTrack => {
    this.stopsSource = this.map.getSource(mapConfig.STOPS_SOURCE_ID)
    const radius = isMobile ? 7 : 4
    const radiusSelected = isMobile ? 8 : 5
    const stops = Object.values(this.routes.stops).map(stop => {
      const selected = selectedTrack && stop.id === selectedTrack.properties.id
      return {
        code: stop.code,
        geometry: {
          coordinates: [stop.lng, stop.lat],
          type: 'Point',
        },
        properties: {
          bearing: undefined,
          code: stop.c,
          color: selected ? '#ccff00' : '#00ad9f',
          descr: stop.d,
          descr_en: stop.d_en,
          icon: undefined,
          id: stop.id,
          opacity: 1,
          strokeColor: '#00897e',
          strokeWidth: selected ? 4 : 1,
          radius: selected ? radiusSelected : radius,
          type: 'stop',
        },
        type: 'Feature',
      }
    })

    window.requestAnimationFrame(() => {
      this.stopsSource.setData({
        type: 'FeatureCollection',
        features: stops,
      })
    })
  }

  /**
   * Updates the selected route in the store
   */
  updateSelectedTrack = data => {
    const selectedTrack = store.getState().selectedTrack
    const selectedTrackLocation =
      selectedTrack && data[selectedTrack.properties.id]

    if (!selectedTrackLocation) {
      return
    }

    this.selectFeature({
      ...selectedTrack,
      properties: {
        ...selectedTrack.properties,
        timestamp: selectedTrackLocation.timestamp,
      },
    })
  }
}
