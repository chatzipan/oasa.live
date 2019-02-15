// @flow

import colors, { defaultColors, selectedStrokeColor } from '../config/colors'

/**
 * Get the color for a track circle.
 * @param  {object} track  The track
 * @param  {object} selectedTrack  The currently selected track
 * @return {array}  The fill and stroke colors
 */
export default function(track, selectedTrack) {
  let trackColors = null
  const typeColors = colors[track.type]

  if (Array.isArray(typeColors)) {
    trackColors = typeColors
  } else {
    trackColors = typeColors[track.routeName]
  }

  if (!Array.isArray(trackColors)) {
    return defaultColors
  }

  const isSelectedTrack = selectedTrack && selectedTrack.id === track.id
  if (isSelectedTrack) {
    return [trackColors[0], selectedStrokeColor]
  }

  return trackColors
}
