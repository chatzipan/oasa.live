import PropTypes from 'prop-types'
import React from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'

import GeoLocation from '../GeoLocation'
import { toggleMenu } from '../../redux/ui'

import InfoIcon from '../../assets/svgs/info.svg'
import MoreIcon from '../../assets/svgs/more.svg'

import styles from './Header.module.css'

const Header = ({ children, map, toggleMenu, isMenuOpen }) => {
  const heading = isMenuOpen ? 'Menu' : 'Athens Live Map'
  const classNames = cx(styles.wrapper, {
    [styles.isMenuOpen]: isMenuOpen,
  })

  return (
    <div className={classNames}>
      <h1 className={styles.header}>{heading}</h1>
      <button className={styles.button} onClick={toggleMenu}>
        <InfoIcon />
      </button>
      <GeoLocation map={map} />
      <button className={cx(styles.button, styles.more)} onClick={toggleMenu}>
        <MoreIcon />
      </button>
    </div>
  )
}

Header.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
}

const mapStateToProps = ({ ui: { isMenuOpen } }) => ({
  isMenuOpen,
})

const mapDispatchToProps = {
  toggleMenu,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)
