import * as animation from './animation'
import PointGenerator from './point-generator'
import store from '../redux/store'

const DEFAULT_INTERVAL = 20000

/**
 * Fetches track data
 *
 * @return {Promise}  Resolves with the track data
 */
function fetchTracks() {
  return fetch('/.netlify/functions/getLocations').then(response =>
    response.json()
  )
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
  constructor(map, { routes, fetchedLocations, selectTrack }) {
    this.map = map
    this.routes = routes
    this.fetchedLocations = fetchedLocations
    this.selectTrack = selectTrack
    this.pointGenerator = new PointGenerator()
  }

  /**
   * Transform an object of locations to a map point array
   * @param  {data} Object  The locations object
   */
  getPointData = data => {
    const { details, lines, coordinates } = this.routes

    return Object.entries(data).map(([vehicleNum, location]) => {
      const { CS_LAT, CS_LNG, ROUTE_CODE, timestamp, speed } = location
      const { descr, line } = details[ROUTE_CODE]

      return {
        currentLocation: {
          type: 'Point',
          coordinates: [parseFloat(CS_LNG), parseFloat(CS_LAT)],
        },
        delay: 2,
        details: { descr, name: lines[line].id },
        distanceCovered: location.covered,
        id: vehicleNum,
        journeyId: ROUTE_CODE,
        line: {
          geometry: {
            type: 'LineString',
            coordinates: coordinates[ROUTE_CODE],
          },
          properties: {},
          type: 'Feature',
        },
        nextDestination: '',
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

  /**
   * Refrehes the data.
   */
  refresh = () => {
    fetchTracks()
      .then(this.processResponse)
      .catch(this.handleError)
  }

  /**
   * Sets a timer for the data refreshal.
   * @param  {number} [timeout=DEFAULT_INTERVAL]  The timeout
   */
  setTimer(timeout = DEFAULT_INTERVAL) {
    if (this.timer) {
      clearTimeout(this.timer)
    }

    this.timer = setTimeout(this.refresh, timeout)
  }

  /**
   * Updates the selected route in the store
   */
  updateSelectedTrack = data => {
    const selectedTrack = store.getState().selectedTrack
    if (selectedTrack) {
      const selectedTrackLocation = data[selectedTrack.properties.id]
      selectedTrackLocation &&
        this.selectTrack({
          ...selectedTrack,
          properties: {
            ...selectedTrack.properties,
            timestamp: selectedTrackLocation.timestamp,
          },
        })
    }
  }
}
