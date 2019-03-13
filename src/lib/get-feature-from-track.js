// @flow
import * as turf from '@turf/helpers'
import cheapRuler from 'cheap-ruler'

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
 * Checks if a track is valid and should be rendered.
 * @param  {object} track  The track
 * @return {boolean} -
 */
function isValidTrack(track, foo) {
  const isGeometryMissing = !track.line

  if (isGeometryMissing) {
    return false
  }

  return true
}

/**
 * Generates a feature from a track. Interpolating the current position based
 * on time.
 * @param  {object} track  The track
 * @param  {number} now  The now time, used for interpolation
 * @param  {object} selectedTrack  The currently selected track
 * @return {object}  A GeoJSON Point feature
 */
export default function getFeatureFromTrack(track, now, selectedTrack) {
  if (!isValidTrack(track)) {
    return null
  }

  const distanceCovered = track.distanceCovered
  const timeSpan = now - track.timestamp
  const speed = track.speed
  const diff = timeSpan * speed
  const distanceDriven = distanceCovered + diff
  const point = turf.point(
    ruler.along(track.line.geometry.coordinates, distanceDriven)
  )

  if (!point) {
    return null
  }

  const [color, strokeColor] = getColors(track, selectedTrack)
  const opacity = getOpacity(track, selectedTrack)
  point.properties = {
    bearing: undefined,
    color,
    delay: track.delay,
    descr: track.descr,
    distanceCovered: track.distanceCovered,
    id: track.id,
    icon: undefined,
    name: track.name,
    opacity,
    routeCode: track.routeCode,
    routeName: track.route,
    speed: track.speed,
    strokeWidth: 2,
    strokeColor,
    timestamp: track.timestamp,
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
