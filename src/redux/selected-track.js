const SELECT = 'selected-track/SELECT';

/**
 * Reducer function for selected track state.
 * @param  {object} state  The current state
 * @param  {object} action  The action to apply
 * @return {object}  The new state
 */
export default function(state = null, action = {}) {
  if (action.type === SELECT) {
    return action.track ? {...action.track} : null;
  }

  return state;
}

/**
 * Action creator to select a track.
 * @param  {object} track  The selected track
 * @return {object}  The SELECT action
 */
export function selectTrack(track) {
  return {type: SELECT, track};
}



// WEBPACK FOOTER //
// ./app/ducks/selected-track.js