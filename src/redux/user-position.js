import localStorageKey from '../config/local-storage-key'

const UPDATE = 'user-position/UPDATE'

const localStorage =
  typeof window !== 'undefined'
    ? window.localStorage
    : {
        getItem: () => {},
        setItem: () => {},
      }

/**
 * Reducer function for user position state.
 * @param  {object} state  The current state
 * @param  {object} action  The action to apply
 * @return {object}  The new state
 */
export default function reducer(state = null, action = {}) {
  if (action.type === UPDATE) {
    return action.position
  }

  return state
}

/**
 * Action creator to update the user position.
 * @param  {array} position  The [lng, lat] position
 * @return {object}  The UPDATE action
 */
export function updateUserPosition(position) {
  return { type: UPDATE, position }
}

/**
 * Redux middleware to store user position in localstorage.
 * @return {function}  The middleware
 */
export function userPositionMiddleware() {
  return next => action => {
    next(action) // eslint-disable-line callback-return

    if (typeof window !== 'undefined') {
      if (action.type === UPDATE) {
        const localState = JSON.parse(localStorage.getItem(localStorageKey))

        localStorage.setItem(
          'hvv-live-map',
          JSON.stringify({
            ...localState,
            userPosition: action.position,
          })
        )
      }
    }

    return action
  }
}

// WEBPACK FOOTER //
// ./app/ducks/user-position.js
