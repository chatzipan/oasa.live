import PropTypes from 'prop-types'
import React from 'react'
import cx from 'classnames'

import InfoIcon from '../../assets/svgs/info.svg'
import MoreIcon from '../../assets/svgs/more.svg'

import styles from './Header.module.css'

const Header = ({ children, onClick, isMenuOpen }) => {
  const heading = isMenuOpen ? 'Menu' : 'Athens Live Map'
  const classNames = cx(styles.wrapper, {
    [styles.isMenuOpen]: isMenuOpen,
  })

  return (
    <div className={classNames}>
      <h1 className={styles.header}>{heading}</h1>
      <button className={styles.button} onClick={onClick}>
        <InfoIcon />
      </button>
      {children}
      <button className={cx(styles.button, styles.more)} onClick={onClick}>
        <MoreIcon />
      </button>
    </div>
  )
}

Header.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
}

export default Header
