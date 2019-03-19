import localStorageKey from '../config/local-storage-key'

const mockStorage = {
  getItem: () => {},
  setItem: () => {},
}

const localStorage =
  typeof window !== 'undefined' ? window.localStorage : mockStorage

/**
 * State selector for the user position.
 * @param  {object} state  The state object
 * @return {array|null}  A [lng, lat] position or null
 */
export default function(state) {
  const { userPosition } = state

  if (!userPosition && typeof window !== 'undefined') {
    const storedPositon = JSON.parse(localStorage.getItem(localStorageKey))

    if (storedPositon) {
      return storedPositon.userPosition
    }

    return null
  }

  return userPosition
}
