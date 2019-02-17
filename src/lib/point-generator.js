// @flow
import cheapRuler from 'cheap-ruler'
import turfBbox from '@turf/bbox'
import rbush from 'rbush'

import getFeatureFromTrack from './get-feature-from-track'
import mapConfig from '../config/map'
import store from '../redux/store'
import selectSelectedTrack from '../selectors/select-selected-track'

const ruler = cheapRuler(mapConfig.CENTER[1])

/**
 * Checks if a point is inside a given bounding box
 * @param {FeatureType} point  The point
 * @param {BoundingBoxType} bounds  The bounding box
 * @returns {boolean}  Whether the point is inside the bounding box
 */
function inBounds(point, bounds) {
  if (point && point.geometry && point.geometry.type === 'Point') {
    const [sw, ne] = bounds
    const bbox = [sw[0], sw[1], ne[0], ne[1]]
    return ruler.insideBBox(point.geometry.coordinates, bbox)
  }

  return false
}

/**
 * Creates a bounding box of a track.
 * @param {TrackType} track  The track
 * @returns {Object}  The bounding box
 */
function getTrackBounds(track) {
  const [minX, minY, maxX, maxY] = turfBbox(track.line)

  return {
    minX,
    minY,
    maxX,
    maxY,
    id: track.id,
  }
}

/**
 * A component to efficiently creates interpolates points from tracks.
 * @class PointGenerator
 */
export default class PointGenerator {
  points = new Map()
  tracks = []
  tree = rbush(4)

  constructor(selectedTrack) {
    this.selectedTrack = selectedTrack
  }

  /**
   * Clears internal data stores.
   * @returns {PointGenerator}  The point generator instance
   */
  clear() {
    this.tree.clear()
    this.points.clear()

    return this
  }

  /**
   * Retrieves the track ids of a given bounding box.
   * @param {BoundingBoxType} bounds  The bounding box
   * @returns {Set<string>}  The ids
   */
  getIdsInBounds(bounds) {
    const [[minX, minY], [maxX, maxY]] = bounds

    return new Set(
      this.tree.search({ minX, minY, maxX, maxY }).map(item => item.id)
    )
  }

  /**
   * Generates points fror the tracks given the current map bounds.
   * @param {BoundingBoxType} currentBounds  The bounding box
   * @returns {Array<FeatureType>}  The points
   */
  getPoints(currentBounds) {
    const selectedTrack = selectSelectedTrack(store.getState())
    const now = new Date()
    const localOffset = now.getTimezoneOffset()
    const athensOffset = -120
    const offsetDiff = localOffset - athensOffset
    now.setMinutes(now.getMinutes() + offsetDiff)

    const idsInBounds = this.getIdsInBounds(currentBounds)

    for (let i = 0; i < this.tracks.length; i++) {
      const track = this.tracks[i]

      // only handle tracks which are in the current bounds
      if (!idsInBounds.has(track.id)) {
        continue
      }
      const feature = getFeatureFromTrack(track, now.getTime(), selectedTrack)

      if (feature && inBounds(feature, currentBounds)) {
        this.points.set(track.id, feature)
      } else if (feature === null) {
        this.points.delete(track.id)
      }
    }

    const points = []
    this.points.forEach(point => points.push(point))

    return points
  }

  /**
   * Set the tracks of the point generator.
   * @param {Array<TrackType>} tracks  The tracks
   * @returns {PointGenerator}  The point generator instance
   */
  setTracks(tracks) {
    this.tracks = tracks
    const trackBboxes = this.tracks.map(getTrackBounds)
    this.tree.load(trackBboxes)

    return this
  }
}
