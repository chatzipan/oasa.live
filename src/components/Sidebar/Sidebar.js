import React from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'
import Select from '@material-ui/core/NativeSelect'
import Switch from '@material-ui/core/Switch'

import translations from '../../../translations'
import { selectLanguage, setNightMode, toggleMenu } from '../../redux/ui'
import track from '../../lib/track'

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
  const handleSelectLanguage = e => {
    track('select_language', {
      event_category: 'select_ui_options',
      event_value: e.target.value,
    })
    selectLanguage(e.target.value)
  }

  const handleSelectNightMode = e => {
    track('select_nightmode', {
      event_category: 'select_ui_options',
      event_value: e.target.checked,
    })
    setNightMode(e.target.checked)
  }

  const handleToggleMenu = e => {
    track('toggle_menu', {
      event_category: 'select_ui_options',
    })
    toggleMenu()
  }

  return (
    <div className={classNames}>
      <div className={cx(styles.title, styles.box)}>
        <h1 className={styles.heading}>Athens Live Map</h1>
        <button className={styles.button} onClick={handleToggleMenu}>
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
            onChange={handleSelectLanguage}
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
            onChange={handleSelectNightMode}
            value="nightMode"
          />
        </div>
      </div>

      <footer className={cx(styles.box, styles.footer)}>
        <p>
          Developed by&nbsp;
          <a href="https://vasil.is" target="_blank">
            vasil.is
          </a>
          .&nbsp;&nbsp;-&nbsp;&nbsp;Tips:
        </p>
        <ul className={styles.donations}>
          <li className={styles.item}>
            &#8383;: 39sSadVgDZNnz7nJCcSk3R6cmY9Uwq51ZC
          </li>
          <li className={styles.item}>
            &ETH;:0x437883fFe75Efa387a339F9a0640cdFFECfAfBe9
          </li>
        </ul>
      </footer>
    </div>
  )
}

const mapStateToProps = ({ ui: { isMenuOpen, isNightMode, language } }) => ({
  isMenuOpen,
  isNightMode,
  language,
})

const mapDispatchToProps = {
  selectLanguage,
  setNightMode,
  toggleMenu,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar)
