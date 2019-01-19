import { applyMiddleware, combineReducers, compose, createStore } from 'redux'

import activeTypes, { activeTypesMiddleware } from './redux/active-types'
import selectedTrack from './redux/selected-track'
import userPosition, { userPositionMiddleware } from './redux/user-position'

const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      })
    : compose

const reducers = combineReducers({
  activeTypes,
  selectedTrack,
  userPosition,
})

const enhancer = composeEnhancers(
  applyMiddleware(userPositionMiddleware, activeTypesMiddleware)
)

export default createStore(reducers, enhancer)
