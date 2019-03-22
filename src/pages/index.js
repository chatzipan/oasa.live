import React, { Component } from 'react'
import unfetch from 'unfetch'
import { connect } from 'react-redux'

import Header from '../components/Header'
import Layout from '../components/Layout'
import SEO from '../components/Seo'
import SelectedFeature from '../components/SelectedFeature'
import Sidebar from '../components/Sidebar'

import mapConfig from '../config/map'
import createMap, { addMapLayers } from '../lib/map'
import TrackManager from '../lib/track-manager'
import { getCookie, setCookie } from '../lib/cookies'

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
  styleHasChanged = false
  state = {
    hasError: false,
    isNightMode: true,
    language: getCookie('language') || 'gr',
    map: null,
    sidebarOpen: false,
  }

  componentDidMount() {
    console.log('getCookie(isNightMode)', getCookie('isNightMode'))
    console.log('getCookie(language)', getCookie('language'))
    this.fetchStaticData()
    this.initEventHandlers()
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ hasError: true })
    window.Sentry.configureScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key])
      })
    })
    window.Sentry.captureException(error)
  }
  componentDidUpdate(prevProps, prevState) {
    const { selectedTrack } = this.props
    const { isNightMode } = this.state

    if (isNightMode !== prevState.isNightMode) {
      const mapStyle = isNightMode
        ? mapConfig.STYLE_NIGHT_MODE
        : mapConfig.STYLE

      this.map = this.map.setStyle(mapStyle, { diff: false })
    }

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
    this.map = await createMap(
      this.mapRoot,
      this.props.selectFeature,
      this.state.language,
      this.state.isNightMode
    )
    this.trackManager = new TrackManager(this.map, this.props)
    this.trackManager.fetchTracks()
    this.trackManager.renderStops()

    this.map.on('styledata', async event => {
      if (this.styleHasChanged) {
        this.styleHasChanged = false
        await addMapLayers(
          this.map,
          this.props.selectFeature,
          this.state.language
        )
        this.trackManager.resumeAnimation()
        this.trackManager.renderStops(this.props.selectedTrack)
      }
    })

    this.map.on('styledataloading', event => {
      this.styleHasChanged = true
    })

    this.setState({
      map: this.map,
    })
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
    setCookie('language', e.target.value, 30)
  }

  handleNightModeChange = () => {
    const isNightMode = !this.state.isNightMode
    this.setState({
      isNightMode,
    })

    setCookie('isNightMode', isNightMode, 30)
  }

  toggleSidebar = () => {
    this.setState({
      sidebarOpen: !this.state.sidebarOpen,
    })
  }

  render() {
    const { isNightMode, map, language, sidebarOpen } = this.state
    console.log('Home', { isNightMode })
    return (
      <Layout>
        <SEO />
        <Header
          isMenuOpen={sidebarOpen}
          map={map}
          onClick={this.toggleSidebar}
        />
        <Sidebar
          isNightMode={isNightMode}
          isOpen={sidebarOpen}
          lang={language}
          onClick={this.toggleSidebar}
          onLanguageChange={this.handleLanguageChange}
          onNightModeChange={this.handleNightModeChange}
        />
        <div className={styles.map} ref={this.createRef} />
        {map && (
          <SelectedFeature
            isNightMode={isNightMode}
            lang={language}
            map={map}
          />
        )}
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
