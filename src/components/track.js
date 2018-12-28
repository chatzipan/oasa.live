import store from '../store';
import selectSelectedTrack from '../selectors/select-selected-track';
import getColors from '../lib/get-colors';
import trackToGeoJson from '../lib/track-to-geojson';

const mapConfig = require('../config/map');

const emptyCollection = {
  type: 'FeatureCollection',
  features: []
};

const lineSourceId = mapConfig.TRACK_LINE_SOURCE_ID;
const lineLayerId = mapConfig.TRACK_LINE_LAYER_ID;
const beforeLayer = mapConfig.SHADOW_LAYER_ID;

export default class Track {
  /**
   * @prop {Set<string>} layers  The set of available track layers
   */
  layers = new Set();

  /**
   * @prop {string|null} currentLayerId  The id of the currently active track
   *  layer
   */
  currentLayerId = null;

  constructor(map) {
    this.map = map;

    // Tracks
    this.map.addSource(lineSourceId, {type: 'geojson', data: emptyCollection});
    store.subscribe(this.onStateChange.bind(this));
  }

  /**
   * Handles changes to the app state.
   */
  onStateChange() {
    const selectedTrack = selectSelectedTrack(store.getState());

    if (selectedTrack) {
      this.update(selectedTrack);
    } else {
      this.clear();
    }
  }

  /**
   * Updates the selected journey track.
   * @param  {object} properties  Properties of the selected feature
   */
  update(properties) {
    const id = properties.journeyId;

    if (!id) {
      return;
    }

    const lineSource = this.map.getSource(lineSourceId);
    const url = `/tracks/csv/${id}.csv`;

    fetch(url)
      .then(response => response.text())
      .then(csvString => trackToGeoJson(csvString))
      .then(geoJson => {
        lineSource.setData(geoJson);
        const lineColor = getColors(properties, properties);
        this.renderTrack(lineColor[0]);
      })
      .catch(error => console.error(error));
  }

  /**
   * Renders the line layer for the track.
   * @param {string} color  The color the track should be rendered in
   */
  renderTrack(color) {
    const id = `${lineLayerId}-${color}`;

    if (!this.layers.has(id)) {
      this.map.addLayer(
        {
          source: lineSourceId,
          type: 'line',
          id,
          paint: {'line-width': 3, 'line-color': color},
          layout: {visibility: 'none'}
        },
        beforeLayer
      );
      this.layers.add(id);
    }

    if (this.currentLayerId) {
      this.map
        .getLayer(this.currentLayerId)
        .setLayoutProperty('visibility', 'none');
    }

    this.map.getLayer(id).setLayoutProperty('visibility', 'visible');
    this.map
      .getLayer(mapConfig.SHADOW_LAYER_ID)
      .setLayoutProperty('visibility', 'none');
    this.currentLayerId = id;
  }

  /**
   * Clears the selected journey track.
   */
  clear() {
    const source = this.map.getSource(lineSourceId);
    source.setData(emptyCollection);
    this.map
      .getLayer(mapConfig.SHADOW_LAYER_ID)
      .setLayoutProperty('visibility', 'visible');
  }
}



// WEBPACK FOOTER //
// ./app/ui/track.js