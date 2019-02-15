import React, { Component } from 'react'
import unfetch from 'unfetch'
import { connect } from 'react-redux'

import GeoLocation from '../components/GeoLocation'
import Header from '../components/Header'
import Layout from '../components/Layout'
import SEO from '../components/Seo'
import SelectedTrack from '../components/SelectedTrack'

import mapConfig from '../config/map'
import createMap from '../lib/map'
import TrackManager from '../lib/track-manager'

import { fetchedLocations } from '../redux/locations'
import { fetchedRouteData } from '../redux/routes'
import { selectTrack } from '../redux/selected-track'

import styles from './index.module.css'

if (typeof window !== 'undefined') {
  const mapboxgl = require('mapbox-gl')

  if (!window.fetch) {
    window.fetch = unfetch
  }
  mapboxgl.accessToken = mapConfig.TOKEN
}

class IndexPage extends Component {
  state = {
    map: null,
  }

  componentDidMount() {
    fetch('/.netlify/functions/getLocations')
      .then(response => response.json())
      .then(this.props.fetchedRouteData)
      .then(this.createMap)
  }

  componentWillUnmount() {
    this.map.remove()
  }

  createMap = async () => {
    this.map = await createMap(this.container, this.props.selectTrack)
    new TrackManager(this.map, this.props).refresh()

    this.setState({
      map: this.map,
    })
    // const sidebar = new Sidebar() // eslint-disable-line
  }

  createRef = x => {
    this.container = x
  }

  render() {
    const { map } = this.state

    return (
      <Layout>
        <SEO title="Home" keywords={['gatsby', 'application', `react`]} />
        <Header>{map && <GeoLocation map={map} />}</Header>
        <div className={styles.map} ref={this.createRef} />
        {map && <SelectedTrack map={map} />}
      </Layout>
    )
  }
}

const mapStateToProps = ({ routes, selectedTrack }) => ({
  routes,
  selectedTrack,
})

export default connect(
  mapStateToProps,
  {
    selectTrack,
    fetchedRouteData,
    fetchedLocations,
  }
)(IndexPage)
