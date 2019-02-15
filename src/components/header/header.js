import PropTypes from 'prop-types'
import React from 'react'

import styles from './Header.module.css'

const Header = ({ children }) => (
  <div className={styles.wrapper}>
    <h1 className={styles.header}>Athens Live Map</h1>
    {children}
  </div>
)

Header.propTypes = {
  children: PropTypes.node,
}

export default Header
