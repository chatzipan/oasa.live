import React, { Component } from 'react'
import unfetch from 'unfetch'
import { connect } from 'react-redux'

import GeoLocation from '../components/GeoLocation'
import Header from '../components/Header'
import Layout from '../components/Layout'
import SEO from '../components/Seo'
import SelectedFeature from '../components/SelectedFeature'

import mapConfig from '../config/map'
import createMap from '../lib/map'
import TrackManager from '../lib/track-manager'

import { fetchedRouteData } from '../redux/routes'
import { selectFeature } from '../redux/selected-feature'

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
    fetch('/.netlify/functions/getStaticData')
      .then(response => response.json())
      .then(this.props.fetchedRouteData)
      .then(this.createMap)
  }

  componentDidUpdate(prevProps) {
    const { selectedTrack } = this.props

    if (selectedTrack !== prevProps.selectedTrack) {
      if (selectedTrack && selectedTrack.properties.type === 'stop') {
        this.trackManager.renderStops(selectedTrack)
      } else {
        this.trackManager.renderStops()
      }
    }
  }

  componentWillUnmount() {
    this.map.remove()
  }

  createMap = async () => {
    this.map = await createMap(this.mapRoot, this.props.selectFeature)
    this.trackManager = new TrackManager(this.map, this.props)
    this.trackManager.refresh()
    this.trackManager.renderStops()

    this.setState({
      map: this.map,
    })
    // const sidebar = new Sidebar() // eslint-disable-line
  }

  createRef = x => {
    this.mapRoot = x
  }

  render() {
    const { map } = this.state

    return (
      <Layout>
        <SEO />
        <Header>{map && <GeoLocation map={map} />}</Header>
        <div className={styles.map} ref={this.createRef} />
        {map && <SelectedFeature map={map} />}
      </Layout>
    )
  }
}

const mapStateToProps = ({ mapCenter, routes, selectedTrack }) => ({
  mapCenter,
  routes,
  selectedTrack,
})

export default connect(
  mapStateToProps,
  {
    fetchedRouteData,
    selectFeature,
  }
)(IndexPage)
