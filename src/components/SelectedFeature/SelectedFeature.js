import React from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'

import SelectedStop from './SelectedStop'
import SelectedTrack from './SelectedTrack'

import styles from './SelectedFeature.module.css'

const SelectedFeature = ({ map, selected }) => {
  const classNames = cx(styles.bar, { [styles.hidden]: !selected })
  if (!selected || !map) return <div className={classNames} />
  const { type } = selected.properties
  const isBus = type === 'bus'
  return (
    <div className={styles.bar}>
      {isBus ? (
        <SelectedTrack map={map} selected={selected} />
      ) : (
        <SelectedStop selected={selected} />
      )}
    </div>
  )
}

const mapStateToProps = ({ selectedTrack }) => ({
  selected: selectedTrack,
})

export default connect(
  mapStateToProps,
  null
)(SelectedFeature)
