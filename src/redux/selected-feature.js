const SELECT = 'selected-feature/SELECT'

/**
 * Reducer function for selected feature state.
 * @param  {object} state  The current state
 * @param  {object} action  The action to apply
 * @return {object}  The new state
 */
export default function(state = null, action = {}) {
  if (action.type === SELECT) {
    return action.payload || null
  }

  return state
}

/**
 * Action creator to select a track or a stop.
 * @param  {object} track  The selected feature
 * @return {object}  The SELECT action
 */
export function selectFeature(feature) {
  return { type: SELECT, payload: feature }
}
