import store from './store'

import TrackManager from './lib/track-manager'
import initializeServiceWoker from './lib/initialize-service-worker'

import createMap from './lib/map'
import Details from './components/details'
import GeoLocation from './components/geo-location'
import Sidebar from './components/sidebar'
import Track from './components/track'

initializeServiceWoker()

createMap(map => {
  const journeyManager = new TrackManager(map, store)
  const geoLocation = new GeoLocation(map)
  const details = new Details() // eslint-disable-line
  const track = new Track(map) // eslint-disable-line
  const sidebar = new Sidebar() // eslint-disable-line

  journeyManager.refresh()
  geoLocation.refresh()
})
