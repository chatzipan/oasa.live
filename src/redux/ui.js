const TOGGLE_MENU = 'ui/TOGGLE_MENU'

const initialState = {
  isNightMode: false,
  language: 'gr',
  isMenuOpen: false,
}

export default function(state = initialState, action = {}) {
  if (action.type === TOGGLE_MENU) {
    return {
      ...state,
      isMenuOpen: !state.isMenuOpen,
    }
  }

  return state
}

export function toggleMenu(feature) {
  return { type: TOGGLE_MENU }
}
