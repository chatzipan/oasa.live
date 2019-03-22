import React from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'
import Select from '@material-ui/core/NativeSelect'
import Switch from '@material-ui/core/Switch'

import translations from '../../../translations'
import { selectLanguage, setNightMode, toggleMenu } from '../../redux/ui'

import styles from './Sidebar.module.css'
import InfoIcon from '../../assets/svgs/info.svg'

/**
 * The sidebar UI element containing journey statistics and filters.
 */
const Sidebar = ({
  isNightMode,
  isMenuOpen,
  language,
  toggleMenu,
  selectLanguage,
  setNightMode,
}) => {
  const t = translations[language]
  const classNames = cx(styles.sidebar, {
    [styles.hidden]: !isMenuOpen,
  })

  return (
    <div className={classNames}>
      <div className={cx(styles.title, styles.box)}>
        <h1 className={styles.heading}>Athens Live Map</h1>
        <button className={styles.button} onClick={toggleMenu}>
          <InfoIcon />
        </button>
      </div>
      <div className={styles.infotext}>
        <p dangerouslySetInnerHTML={{ __html: t['MENU_INFO'] }} />
      </div>
      <div className={styles.options}>
        <div className={styles.language}>
          <p className={styles.label}>{t['CHOOSE_LANG']}</p>
          <Select
            inputProps={{ name: 'language' }}
            onChange={selectLanguage}
            value={language}
          >
            <option value="gr">Ελληνικά</option>
            <option value="en">English</option>
          </Select>
        </div>
        <div className={styles.nightmode}>
          <p className={styles.label}>Night Mode:</p>
          <Switch
            checked={isNightMode}
            onChange={setNightMode}
            value="nightMode"
          />
        </div>
      </div>

      <footer className={cx(styles.box, styles.footer)}>
        <p>
          Developed by{' '}
          <a href="https://twitter.com/__vasilis" target="_blank">
            @vasilis
          </a>
        </p>
      </footer>
    </div>
  )
}

const mapStateToProps = ({ ui: { isMenuOpen, isNightMode, language } }) => ({
  isMenuOpen,
  isNightMode,
  language,
})

const mapDispatchToProps = dispatch => {
  return {
    selectLanguage: e => dispatch(selectLanguage(e.target.value)),
    setNightMode: e => dispatch(setNightMode(e.target.checked)),
    toggleMenu: x => dispatch(toggleMenu()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar)
