import isMobile from '../config/is-mobile'
import localStorageKey from '../config/local-storage-key'
import VERSION from '../config/version'

const TOGGLE = 'active-types/TOGGLE'

const localStorage =
  typeof window !== 'undefined'
    ? window.localStorage
    : {
        getItem: () => {},
        setItem: () => {},
      }

const defaultInitialState = {
  bus: isMobile ? false : true,
  ferry: true,
  train: true,
  subway: true,
}

/**
 * Updates the localstorage with given data.
 * @param {object} data  The data to store
 */
function updateLocalStorage(data) {
  if (typeof window !== 'undefined') {
    const localState = JSON.parse(localStorage.getItem(localStorageKey))

    localStorage.setItem(
      localStorageKey,
      JSON.stringify({
        ...localState,
        ...data,
      })
    )
  }
}

/**
 * Returns the initial state based.
 * @returns {object} -
 */
function getInitialState() {
  if (typeof window !== 'undefined') {
    const storedState = JSON.parse(localStorage.getItem(localStorageKey))
    if (!storedState || !storedState.activeTypes) {
      updateLocalStorage({ VERSION, activeTypes: defaultInitialState })
      return getInitialState()
    }

    const storedActiveTypes = storedState.activeTypes
    if (storedState.VERSION !== VERSION) {
      updateLocalStorage({
        VERSION,
        activeTypes: {
          ...storedActiveTypes,
          ...defaultInitialState,
        },
      })

      return getInitialState()
    }

    return storedActiveTypes
  } else return {}
}

/**
 * Reducer function for active type filters.
 * @param  {object} state  The current state
 * @param  {object} action  The action to apply
 * @return {object}  The new state
 */
export default function reducer(state = getInitialState(), action = {}) {
  switch (action.type) {
    case TOGGLE: {
      const type = action.filterType
      return Object.assign({}, state, { [type]: !state[type] })
    }
    default:
      return state
  }
}

/**
 * Redux middleware to store user position in localstorage.
 * @param {object} store  The redux store
 * @return {function}  The middleware
 */
export function activeTypesMiddleware(store) {
  return next => action => {
    next(action) // eslint-disable-line callback-return

    if (action.type === TOGGLE) {
      updateLocalStorage({
        activeTypes: { ...store.getState().activeTypes },
      })
    }

    return action
  }
}

/**
 * Action creator for the type filter toggle action.
 * @param  {string} filterType  The type to toggle
 * @return {object}  The action
 */
export function toggleActiveType(filterType) {
  return { type: TOGGLE, filterType }
}

// WEBPACK FOOTER //
// ./app/ducks/active-types.js
