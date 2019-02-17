const FETCH_LOCATIONS_SUCCESS = 'fetch-data/FETCH_LOCATIONS_SUCCESS'

/**
 * Reducer function for selected track state.
 * @param  {object} state  The current state
 * @param  {object} action  The action to apply
 * @return {object}  The new state
 */

const initialState = {}

export default function(state = initialState, { payload = {}, type }) {
  switch (type) {
    case FETCH_LOCATIONS_SUCCESS: {
      return payload
    }
    default: {
      return state
    }
  }
}

/**
 * Action creator to select a track.
 * @param  {object} track  The selected track
 * @return {object}  The SELECT action
 */
export function fetchedLocations(payload) {
  return { type: FETCH_LOCATIONS_SUCCESS, payload }
}
