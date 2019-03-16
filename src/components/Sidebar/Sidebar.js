import React from 'react'
import cx from 'classnames'
import Select from '@material-ui/core/NativeSelect'
import Switch from '@material-ui/core/Switch'

import styles from './Sidebar.module.css'
import InfoIcon from '../../assets/svgs/info.svg'

/**
 * The sidebar UI element containing journey statistics and filters.
 */
const Sidebar = ({
  isNightMode,
  isOpen,
  language,
  onClick,
  onLanguageChange,
  onNightModeChange,
}) => {
  const classNames = cx(styles.sidebar, {
    [styles.hidden]: !isOpen,
  })

  return (
    <div className={classNames}>
      <div className={cx(styles.title, styles.box)}>
        <h1 className={styles.heading}>Athens Live Map</h1>
        <button className={styles.button} onClick={onClick}>
          <InfoIcon />
        </button>
      </div>
      <div className={styles.infotext}>
        <p>
          Check up on Athens' public transport and see if your bus is on time.
        </p>
        <p>
          The map displays the current positions of public transport vehicles in
          and around Athens and provides you with information on current delays.
        </p>
        <p>
          This project does not take responsibility for the accuracy of location
          data provided by OASA.
        </p>
      </div>
      <div className={styles.options}>
        <div className={styles.language}>
          <p className={styles.label}>Choose Language:</p>
          <Select
            value={language}
            onChange={onLanguageChange}
            inputProps={{ name: 'language' }}
          >
            <option value="greek">Ελληνικά</option>
            <option value="english">English</option>
          </Select>
        </div>
        <div className={styles.nightmode}>
          <p className={styles.label}>Night Mode:</p>
          <Switch
            checked={isNightMode}
            onChange={onNightModeChange}
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

export default Sidebar
