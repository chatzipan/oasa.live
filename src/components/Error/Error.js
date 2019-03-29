import React from 'react'

import './Error.css'
import 'mapbox-gl/dist/mapbox-gl.css'

const Error = () => (
  <div id="error">
    <div id="box" />
    <h3>ERROR 500</h3>
    <p>
      Things are a little <span>unstable</span> here
    </p>
    <p>I suggest come back later</p>
  </div>
)

export default Error
