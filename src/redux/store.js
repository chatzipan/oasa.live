import { applyMiddleware, combineReducers, compose, createStore } from 'redux'

import locations from './locations'
import routes from './routes'
import selectedTrack from './selected-track'
import userPosition, { userPositionMiddleware } from './user-position'

const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose

const reducers = combineReducers({
  locations,
  routes,
  selectedTrack,
  userPosition,
})

const enhancer = composeEnhancers(applyMiddleware(userPositionMiddleware))

export default () => createStore(reducers, enhancer)
