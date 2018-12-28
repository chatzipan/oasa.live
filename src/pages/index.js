import React, { Component } from 'react'
import mapboxgl from 'mapbox-gl'
import Layout from '../components/layout'
import mapConfig from '../config/map'
import unfetch from 'unfetch'

import createMap from '../lib/map'
import TrackManager from '../lib/track-manager'
// import GeoLocation from '../components/geo-location'

import styles from './index.module.css'

if (!window.fetch) {
  window.fetch = unfetch
}

mapboxgl.accessToken = mapConfig.TOKEN

export default class IndexPage extends Component {
  componentDidMount() {
    this.map = createMap(this.container, map => {
      const journeyManager = new TrackManager(map /*store*/)
      //const geoLocation = new GeoLocation(map)
      //const details = new Details() // eslint-disable-line
      //const track = new Track(map) // eslint-disable-line
      // const sidebar = new Sidebar() // eslint-disable-line
      journeyManager.refresh()
      // geoLocation.refresh()
    })
  }

  componentWillUnmount() {
    this.map.remove()
  }

  render() {
    return (
      <Layout>
        <div
          className={styles.map}
          ref={x => {
            this.container = x
          }}
        />
      </Layout>
    )
  }
}
