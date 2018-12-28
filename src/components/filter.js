import selectFilters from '../selectors/select-filters';
import {toggleActiveType} from '../ducks/active-types';
import Events from '../lib/events';
import store from '../store';

const uncheckedIconPath =
  'M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2' +
  ' 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z';
const checkedIconPath =
  'M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8M19,' +
  '3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,' +
  '3 19,3Z';

/**
 * The filter UI element managing journey filters.
 */
export default class Filter extends Events {
  constructor() {
    super();

    const filterContainer = document.querySelector('.filter');
    this.busControl = filterContainer.querySelector('.bus-control');
    this.busCheckbox = this.busControl.querySelector('#bus');

    this.initEventHandlers();
    this.initUI();
  }

  /**
   * Initializes the UI based on the initial state.
   */
  initUI() {
    const initialState = selectFilters(store.getState());

    this.busCheckbox.checked = initialState.type.bus;

    this.updateIcon(this.busControl, this.busCheckbox.checked);
  }

  /**
   * Initiailizes the event handlers on the filter checkbox elements.
   */
  initEventHandlers() {
    this.busCheckbox.addEventListener(
      'change',
      this.onTypeChange.bind(this, 'bus')
    );
  }

  /**
   * Updates the checkbox icon of a control.
   * @param  {HTMLElement} control  The control
   * @param  {boolean} isChecked  Whether it is checked or not
   */
  updateIcon(control, isChecked) {
    const icon = control.querySelector('.checkbox__icon');
    const path = icon.querySelector('path');
    const pathData = isChecked ? checkedIconPath : uncheckedIconPath;
    path.setAttribute('d', pathData);
  }

  /**
   * Change handler for the type filters.
   * @param  {string} type  The type
   */
  onTypeChange(type) {
    store.dispatch(toggleActiveType(type));

    // TODO: remove events, use redux in TrackManager
    this.dispatchEvent({type: 'change'});

    const initialState = selectFilters(store.getState());
    this.updateIcon(this.busControl, initialState.type.bus);
  }
}



// WEBPACK FOOTER //
// ./app/ui/filter.js