// @flow
import type {FilterType} from '../../types/filter';

export default function(state: any): FilterType {
  return {type: state.activeTypes};
}



// WEBPACK FOOTER //
// ./app/selectors/select-filters.js