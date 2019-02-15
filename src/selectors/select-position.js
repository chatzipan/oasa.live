import localStorageKey from '../config/local-storage-key'
import inside from '@turf/inside'
import boundingBox from '../config/bounding-box'
import * as turf from '@turf/turf'

/**
 * State selector for the user position.
 * @param  {object} state  The state object
 * @return {array|null}  A [lng, lat] position or null
 */
export default function(state) {
  console.log('select-position', state)
  const { userPosition } = state

  if (!userPosition) {
    const storedPositon = JSON.parse(localStorage.getItem(localStorageKey))

    if (storedPositon) {
      return storedPositon.userPosition
    }

    return null
  }

  if (!inside(turf.point(userPosition), boundingBox)) {
    return null
  }

  return userPosition
}
