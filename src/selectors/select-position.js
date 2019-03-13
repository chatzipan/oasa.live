import localStorageKey from '../config/local-storage-key'

/**
 * State selector for the user position.
 * @param  {object} state  The state object
 * @return {array|null}  A [lng, lat] position or null
 */
export default function(state) {
  const { userPosition } = state

  if (!userPosition) {
    const storedPositon = JSON.parse(localStorage.getItem(localStorageKey))

    if (storedPositon) {
      return storedPositon.userPosition
    }

    return null
  }

  return userPosition
}
