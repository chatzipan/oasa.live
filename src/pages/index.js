import React, { Component } from 'react'
import unfetch from 'unfetch'
import { connect } from 'react-redux'

import Error from '../components/Error'
import FakeContent from '../components/FakeContent'
import Header from '../components/Header'
import Layout from '../components/Layout'
import SEO from '../components/Seo'
import SelectedFeature from '../components/SelectedFeature'
import Sidebar from '../components/Sidebar'

import mapConfig from '../config/map'
import createMap, { addMapLayers, setStopsLabelName } from '../lib/map'
import TrackManager from '../lib/track-manager'
import { getCookie } from '../lib/cookies'
import { closeMenu, selectLanguage, setNightMode } from '../redux/ui'
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
const ONE_DAY = 24 * 60 * 60 * 1000
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
    map: null,
    mountDate: 0,
  }

  async componentDidMount() {
    const mountDate = new Date().getTime()
    this.setState({ mountDate })
    this.props.selectLanguage(getCookie('language') || 'gr')
    this.props.setNightMode(getCookie('isNightMode') === 'true' || false)

    await this.fetchStaticData()
    this.createMap()

    this.initEventHandlers()

    document.addEventListener('visibilitychange', this.handleVisibilityChange)
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

  componentDidUpdate(prevProps) {
    if (!this.map) {
      return
    }

    const { isNightMode, language, selectedTrack } = this.props

    if (language !== prevProps.language) {
      this.map.setLayoutProperty(
        mapConfig.STOPS_LABEL_LAYER_ID,
        'text-field',
        setStopsLabelName(language)
      )
    }

    if (isNightMode !== prevProps.isNightMode) {
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
    this.map = await createMap(this.mapRoot, this.props)
    this.trackManager = new TrackManager(this.map, this.props).init()

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
  }

  handleVisibilityChange = async () => {
    const now = new Date().getTime()
    if (!document.hidden && now - this.state.mountDate > ONE_DAY) {
      // refetch basic data when reactivating tab or PWA after 1 day
      this.fetchStaticData()
    }
  }

  initEventHandlers() {
    window.addEventListener('keydown', event => {
      if (event.keyCode === ESC_KEY && !this.props.isMenuOpen) {
        this.props.closeMenu()
      }
    })
  }

  render() {
    const { map, hasError } = this.state
    if (hasError) {
      return <Error />
    }

    return (
      <Layout>
        <SEO />
        <Header map={map} />
        <Sidebar />
        <div className={styles.map} ref={this.createRef} />
        <SelectedFeature map={map} />
        <FakeContent />
      </Layout>
    )
  }
}

const mapStateToProps = ({
  mapCenter,
  routes,
  selectedTrack,
  ui: { isNightMode, language },
}) => ({
  isNightMode,
  language,
  mapCenter,
  routes,
  selectedTrack,
})

const mapDispatchToProps = {
  closeMenu,
  fetchedRouteData,
  selectLanguage,
  setNightMode,
  selectFeature,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IndexPage)
