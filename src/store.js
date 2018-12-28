import { applyMiddleware, combineReducers, createStore } from 'redux'

import activeTypes, { activeTypesMiddleware } from './redux/active-types'
import selectedTrack from './redux/selected-track'
import userPosition, { userPositionMiddleware } from './redux/user-position'

const reducers = combineReducers({
  activeTypes,
  selectedTrack,
  userPosition,
})

export default createStore(
  reducers,
  applyMiddleware(userPositionMiddleware, activeTypesMiddleware)
)

// WEBPACK FOOTER //
// ./app/store.js
