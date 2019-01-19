// @flow
import * as turf from '@turf/helpers'
import cheapRuler from 'cheap-ruler'

// import type {CoordinateType} from '../../types/bounds';
// import type {FilterType} from '../../types/filter';
// import type {Feature as FeatureType} from 'geojson-flow';
// import type {TrackType} from '../../types/track';

import getIcon from './get-icon'
import getColors from './get-colors'
import mapConfig from '../config/map'

const ruler = cheapRuler(mapConfig.CENTER[1])

/*
 * Get the current line subsegment given a driven distance.
 */
function getSubSegment(line, dist) {
  let sum = 0

  if (dist <= 0) {
    return [line[0], line[1]]
  }

  for (let i = 0; i < line.length - 1; i++) {
    const p0 = line[i]
    const p1 = line[i + 1]
    const d = ruler.distance(p0, p1)
    sum += d
    if (sum > dist) {
      return [p0, p1]
    }
  }

  return [line[0], line[line.length - 1]]
}

/**
 * Get the opacity value for a given track.
 * @param  {object} track  The track
 * @param  {object} selectedTrack  The currently selected track
 * @return {number}  The opacity value
 */
function getOpacity(track, selectedTrack) {
  if (!selectedTrack) {
    return 1
  }

  if (track.routeName !== selectedTrack.routeName) {
    return 0.4
  }

  return 1
}

/**
 * Check if a track should be visible based on filters.
 * @param  {object} track  The track
 * @param  {object} filters  The current filters
 * @return {boolean}  False if segment should not be rendered, else true
 */
function shouldShow(track, filters) {
  return filters.type[track.type]
}

/**
 * Checks if a track is valid and should be rendered.
 * @param  {object} track  The track
 * @param  {number} now  The now time, used for interpolation
 * @param  {object} filters  The current filters
 * @return {boolean} -
 */
function isValidTrack(track, now, filters) {
  const isGeometryMissing = !track.line
  if (isGeometryMissing) {
    return false
  }

  const isFiltered = !shouldShow(track, filters)

  if (isFiltered) {
    return false
  }

  const isActive = track.startTime <= now && track.endTime > now
  if (!isActive) {
    return false
  }

  return true
}

/**
 * Generates a feature from a track. Interpolating the current position based
 * on time.
 * @param  {object} track  The track
 * @param  {number} now  The now time, used for interpolation
 * @param  {object} filters  The current filters
 * @param  {object} selectedTrack  The currently selected track
 * @return {object}  A GeoJSON Point feature
 */
export default function getFeatureFromTrack(
  track,
  now,
  filters,
  selectedTrack
) {
  if (!isValidTrack(track, now, filters)) {
    return null
  }

  const driven = now - track.startTime
  const timeSpan = track.endTime - track.startTime
  const fraction = driven / timeSpan
  const distanceDriven = track.lineDistance * fraction
  const point = turf.point(
    ruler.along(track.line.geometry.coordinates, distanceDriven)
  )
  // console.log(fraction)
  // console.log(point.geometry.coordinates[0], point.geometry.coordinates[1])
  if (!point) {
    return null
  }

  const [color, strokeColor] = getColors(track, selectedTrack)
  const opacity = getOpacity(track, selectedTrack)

  point.properties = {
    bearing: undefined, // eslint-disable-line no-undefined
    color,
    delay: track.delay,
    id: track.id,
    icon: undefined, // eslint-disable-line no-undefined
    journeyId: track.journeyId,
    nextDestination: track.nextDestination,
    opacity,
    routeName: track.routeName,
    strokeWidth: 2,
    strokeColor,
    type: track.type,
  }

  if (selectedTrack !== null && track.id === selectedTrack.id) {
    const subSegment = getSubSegment(
      track.line.geometry.coordinates,
      distanceDriven
    )
    point.properties.bearing = ruler.bearing(...subSegment) + 180
    point.properties.icon = getIcon(track).name
  }

  return point
}
