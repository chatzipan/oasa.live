import { setCookie } from '../lib/cookies'

const CHANCE_LANGUAGE = 'ui/CHANCE_LANGUAGE'
const CLOSE_MENU = 'ui/CLOSE_MENU'
const TOGGLE_MENU = 'ui/TOGGLE_MENU'

const initialState = {
  isNightMode: false,
  language: 'gr',
  isMenuOpen: false,
}

export default function(state = initialState, action = {}) {
  if (action.type === CHANCE_LANGUAGE) {
    return {
      ...state,
      language: action.payload,
    }
  }
  if (action.type === TOGGLE_MENU) {
    return {
      ...state,
      isMenuOpen: !state.isMenuOpen,
    }
  }
  if (action.type === CLOSE_MENU) {
    return {
      ...state,
      isMenuOpen: false,
    }
  }

  return state
}

export function closeMenu(feature) {
  return { type: CLOSE_MENU }
}

export function selectLanguage(payload) {
  setCookie('language', payload, 30)

  return { type: CHANCE_LANGUAGE, payload }
}

export function toggleMenu(feature) {
  return { type: TOGGLE_MENU }
}
