import React from 'react'
import PropTypes from 'prop-types'

import './Layout.css'
import 'mapbox-gl/dist/mapbox-gl.css'

const Layout = ({ children }) => <>{children}</>

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
