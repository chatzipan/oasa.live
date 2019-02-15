import * as animation from './animation'
import PointGenerator from './point-generator'

const DEFAULT_INTERVAL = 60000

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
  tracks = {}

  /**
   * Constructor.
   * @param  {mapbox.Map} map  The map instance
   */
  constructor(map, { routes, fetchedLocations, selectedTrack }) {
    this.map = map
    this.routes = routes
    this.fetchedLocations = fetchedLocations
    this.pointGenerator = new PointGenerator(selectedTrack)
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
    this.fetchedLocations(data)
    const { details, lines, coordinates } = this.routes

    const points = Object.entries(data.locations).map(
      ([vehicleNum, location]) => {
        const { CS_LAT, CS_LNG, ROUTE_CODE, timestamp } = location
        const { distance, descr, line } = details[ROUTE_CODE]

        return {
          details: { descr, name: lines[line].id },
          delay: 2,
          timestamp,
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
          distance,
          distanceCovered: location.covered,
          currentLocation: {
            type: 'Point',
            coordinates: [parseFloat(CS_LNG), parseFloat(CS_LAT)],
          },
          nextDestination: '',
          routeName: data.routeDetails[ROUTE_CODE].line,
          type: 'bus',
        }
      }
    )

    this.setTimer()
    this.updateTracks(points)

    const tracks = [...Object.values(this.tracks)]
    this.pointGenerator.clear().setTracks(tracks)

    const getPoints = () => {
      const bounds = this.map.getBounds().toArray()
      return this.pointGenerator.getPoints(bounds)
    }

    animation.startLoop(getPoints, this.map)
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
   * Update the internal track data.
   * @param  {array.<object>} trackData  The new tracks
   */
  updateTracks(trackData) {
    trackData.forEach(track => {
      this.tracks[track.id] = track
    })
  }
}
