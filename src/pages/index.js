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

import { closeMenu } from '../redux/ui'
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
    isNightMode: false,
    map: null,
  }

  componentDidMount() {
    this.setState(
      {
        isNightMode: getCookie('isNightMode') === 'true' || false,
      },
      () => {
        this.fetchStaticData()
        this.initEventHandlers()
      }
    )
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

    if (isNightMode !== prevState.isNightMode && this.map) {
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
    this.map = await createMap(this.mapRoot, this.props, this.state)
    this.trackManager = new TrackManager(this.map, this.props)
    this.trackManager.fetchTracks()
    this.trackManager.renderStops()

    this.map.on('styledata', async event => {
      if (this.styleHasChanged) {
        this.styleHasChanged = false
        await addMapLayers(this.map, this.props)
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
      if (event.keyCode === ESC_KEY && !this.props.isMenuOpen) {
        this.props.toggleMenu()
      }
    })
  }

  handleNightModeChange = () => {
    const isNightMode = !this.state.isNightMode
    this.setState({
      isNightMode,
    })

    setCookie('isNightMode', isNightMode, 30)
  }

  render() {
    const { isNightMode, map } = this.state

    return (
      <Layout>
        <SEO />
        <Header map={map} />
        <Sidebar
          isNightMode={isNightMode}
          onNightModeChange={this.handleNightModeChange}
        />
        <div className={styles.map} ref={this.createRef} />
        {map && <SelectedFeature isNightMode={isNightMode} map={map} />}
      </Layout>
    )
  }
}

const mapStateToProps = ({ mapCenter, routes, selectedTrack }) => ({
  mapCenter,
  routes,
  selectedTrack,
})

const mapDispatchToProps = {
  closeMenu,
  fetchedRouteData,
  selectFeature,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IndexPage)
