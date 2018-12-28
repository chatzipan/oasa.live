import store from '../store';
import selectSelectedTrack from '../selectors/select-selected-track';

/**
 * The UI element displaying information about the selected journey.
 */
export default class Details {
  constructor() {
    const element = document.querySelector('.bottom-bar');
    const route = element.querySelector('.bottom-bar__info--route');
    const destination = element.querySelector('.bottom-bar__info--destination');

    this.element = element;
    this.route = route;
    this.destination = destination;

    store.subscribe(this.onStateChange.bind(this));
  }

  /**
   * Handles state changes.
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
   * Returns the mapbox bottom left & right attribution controls.
   * @return {array.<HTMLElement>} -
   */
  getMapboxControls() {
    if (!this.mapboxControls) {
      const mapboxControlLeft = document.querySelector(
        '.mapboxgl-ctrl-bottom-left'
      );
      const mapboxControlRight = document.querySelector(
        '.mapboxgl-ctrl-bottom-right'
      );

      this.mapboxControls = [mapboxControlLeft, mapboxControlRight];
    }

    return this.mapboxControls;
  }

  /**
   * Updates the tables content.
   * @param  {object} properties  A selected feature properties
   */
  update(properties) {
    const routeName = properties.routeName;
    const nextDestination = properties.nextDestination;

    let destination = nextDestination;
    if (properties.delay > 0) {
      destination = `${nextDestination} +${properties.delay} min.`;
    }

    this.route.textContent = routeName;
    this.destination.textContent = destination;
    this.setVisibility(true);
  }

  /**
   * Set the visibilty of the bottom bar & mapbox controls.
   * @param  {boolean} shouldShow  Whether to show or hide
   */
  setVisibility(shouldShow) {
    if (shouldShow) {
      this.element.classList.remove('bottom-bar--hidden');
      this.getMapboxControls().forEach(control => {
        control.classList.add('mapboxgl-ctrl--with-bottom-bar');
      });
    } else {
      this.element.classList.add('bottom-bar--hidden');
      this.getMapboxControls().forEach(control => {
        control.classList.remove('mapboxgl-ctrl--with-bottom-bar');
      });
    }
  }

  /**
   * Clears the table content.
   */
  clear() {
    this.route.textContent = '-';
    this.destination.textContent = '-';
    this.setVisibility(false);
  }
}



// WEBPACK FOOTER //
// ./app/ui/details.js