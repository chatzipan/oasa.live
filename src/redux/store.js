import { applyMiddleware, combineReducers, compose, createStore } from 'redux'

import routes from './routes'
import selectedTrack from './selected-feature'
import ui from './ui'
import userPosition, { userPositionMiddleware } from './user-position'

const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose

const reducers = combineReducers({
  routes,
  selectedTrack,
  userPosition,
  ui,
})

const enhancer = composeEnhancers(applyMiddleware(userPositionMiddleware))

export default createStore(reducers, enhancer)
