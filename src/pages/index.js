import React, { Component } from 'react'
import unfetch from 'unfetch'
import { connect } from 'react-redux'

import GeoLocation from '../components/GeoLocation'
import Header from '../components/Header'
import Layout from '../components/Layout'
import SEO from '../components/Seo'
import SelectedFeature from '../components/SelectedFeature'
import Sidebar from '../components/Sidebar'

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

const ESC_KEY = 27
const s3 = 'https://s3.eu-central-1.amazonaws.com/oasa/'
const files = [
  'linesList.json',
  'routePaths.json',
  'routeList.json',
  'routeStops.json',
]

class IndexPage extends Component {
  state = {
    isNightMode: false,
    language: 'greek',
    map: null,
    sidebarOpen: false,
  }

  componentDidMount() {
    this.fetchStaticData()
    this.initEventHandlers()
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

  fetchStaticData = async () => {
    const [lines, coordinates, routeDetails, stops] = await Promise.all(
      files.map(filename => fetch(`${s3}${filename}`).then(r => r.json()))
    )

    this.props.fetchedRouteData({
      stops,
      coordinates,
      lines,
      routeDetails,
    })

    this.createMap()
  }

  initEventHandlers() {
    window.addEventListener('keydown', event => {
      if (event.keyCode === ESC_KEY && !this.state.sidebarOpen) {
        this.toggleSidebar()
      }
    })
  }

  handleLanguageChange = e => {
    this.setState({
      language: e.target.value,
    })
  }

  handleNightModeChange = () => {
    this.setState({
      isNightMode: !this.state.isNightMode,
    })
  }

  toggleSidebar = () => {
    this.setState({
      sidebarOpen: !this.state.sidebarOpen,
    })
  }

  render() {
    const { isNightMode, map, language, sidebarOpen } = this.state

    return (
      <Layout>
        <SEO />
        <Header isMenuOpen={sidebarOpen} onClick={this.toggleSidebar}>
          {map && <GeoLocation map={map} />}
        </Header>
        <Sidebar
          isNightMode={isNightMode}
          isOpen={sidebarOpen}
          language={language}
          onClick={this.toggleSidebar}
          onLanguageChange={this.handleLanguageChange}
          onNightModeChange={this.handleNightModeChange}
        />
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
