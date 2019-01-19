import * as animation from './animation'
// import Filter from '../components/filter'
import PointGenerator from './point-generator'
// import selectFilters from '../selectors/select-filters'
// import types from '../../shared/types'

const DEFAULT_INTERVAL = 60000

/**
 * Fetches track data based on the stale types.
 * @param  {array.<string>} staleTypes  The stale types
 * @return {Promise}  Resolves with the track data
 */
function fetchTracks(staleTypes) {
  // const vehicleTypes = types.reduce((activeTypes, type) => {
  //   if (staleTypes.includes(type.name)) {
  //     activeTypes.push(...type.vehicleTypes)
  //   }
  //   return activeTypes
  // }, [])

  // return fetch(`/tracks?t=${vehicleTypes.join(',')}`).then(response => {
  return fetch('/.netlify/functions/getRoutes').then(response =>
    response.json()
  )
}

/**
 * Figures out if a type of track data is stale.
 * @param  {object} activeTypes  The current type filters
 * @param  {object} lastRequestedTimes  The times of the last
 *   request for each type
 * @return {array.<string>}  The types which are stale
 */
// function getStaleTypes(activeTypes, lastRequestedTimes) {
//   const now = Date.now()

//   const staleTypes = Object.keys(activeTypes).filter(filter => {
//     const isActive = activeTypes[filter]
//     const lastRequest = lastRequestedTimes[filter]
//     const age = now - lastRequest
//     const isStale = age > 30000

//     if (isActive && (!lastRequest || isStale)) {
//       return true
//     }

//     return false
//   })

//   return staleTypes
// }

/**
 * Manages tracks, refreshing data and restarting the animation loop.
 */
export default class TrackManager {
  // filters = new Filter()
  lastRequestedTimes = {}
  pointGenerator = new PointGenerator()
  timer
  tracks = {}

  /**
   * Constructor.
   * @param  {mapbox.Map} map  The map instance
   */
  constructor(map) {
    this.map = map
    // this.filters.on('change', this.refresh.bind(this))
  }

  /**
   * Refrehes the data.
   */
  refresh() {
    // const activeTypes = selectFilters(store.getState()).type
    // const staleTypes = getStaleTypes(activeTypes, this.lastRequestedTimes)

    // if (staleTypes.length < 1) {
    //   return
    // }

    // staleTypes.forEach(type => {
    //   this.lastRequestedTimes[type] = Date.now()
    // })

    // fetchTracks(staleTypes)
    fetchTracks()
      .then(this.processResponse.bind(this))
      .catch(this.handleError.bind(this))
  }

  /**
   * Sets a timer for the data refreshal.
   * @param  {number} [timeout=DEFAULT_INTERVAL]  The timeout
   */
  setTimer(timeout = DEFAULT_INTERVAL) {
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(this.refresh.bind(this), timeout)
  }

  /**
   * Handles a network error, resets the timer.
   * @param  {string} statusText  The response status text
   */
  handleError(statusText) {
    console.error('Failed to fetch tracks: ', statusText)
    this.setTimer()
  }

  /**
   * Update the internal track data.
   * @param  {array.<object>} trackData  The new tracks
   */
  updateTracks(trackData) {
    // delete past tracks
    Object.entries(this.tracks).forEach(([trackId, track]) => {
      if (track.endTime < Date.now) {
        delete this.tracks[track.id]
      }
    })

    // add new tracks
    trackData.forEach(track => {
      this.tracks[track.id] = track
    })
  }

  /**
   * Processes a response.
   * @param  {object} data  The response data
   */
  processResponse(data) {
    console.log('Fetched!')
    console.log('data.oasa', data.oasa)
    const timeout = data.timeRange

    this.setTimer(timeout)
    this.updateTracks(data.tracks)

    const tracks = [...Object.values(this.tracks)]
    this.pointGenerator.clear().setTracks(tracks)

    const getPoints = () => {
      const bounds = this.map.getBounds().toArray()
      return this.pointGenerator.getPoints(bounds)
    }

    animation.startLoop(getPoints, this.map)
  }
}
