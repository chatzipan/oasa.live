const FETCH_ROUTE_DATA_SUCCESS = 'fetch-data/FETCH_ROUTE_DATA_SUCCESS'

/**
 * Reducer function for selected track state.
 * @param  {object} state  The current state
 * @param  {object} action  The action to apply
 * @return {object}  The new state
 */

const initialState = {}

const normalizeStops = stops =>
  Object.values(stops).reduce((acc, routeStops) => {
    routeStops.forEach(stop => {
      acc[stop.c] = stop
    })
    return acc
  }, {})

export default function(state = initialState, { payload = {}, type }) {
  switch (type) {
    case FETCH_ROUTE_DATA_SUCCESS: {
      return {
        ...state,
        coordinates: payload.coordinates,
        details: payload.routeDetails,
        lines: payload.lines,
        routeStops: payload.stops,
        stops: normalizeStops(payload.stops),
      }
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
export function fetchedRouteData(payload) {
  return { type: FETCH_ROUTE_DATA_SUCCESS, payload }
}
