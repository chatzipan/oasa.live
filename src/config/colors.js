// @flow

import type {CircleColorType, ColorConfigType} from '../../types/color';

const colorConfig: ColorConfigType = {
  bus: ['#F0008C', '#B00468'],
  ferry: ['#00AADB', '#007893'],
  subway: {
    U1: ['#0172B6', '#4FAFE9'],
    U2: ['#D8232A', '#95181D'],
    U3: ['#FFDA1A', '#D0B114'],
    U4: ['#00A09B', '#016E6B']
  },
  train: {
    S1: ['#15A748', '#0D7130'],
    S11: ['#15A748', '#0D7130'],
    S21: ['#A22949', '#4C1423'],
    S2: ['#A22949', '#4C1423'],
    S3: ['#572A79', '#200F2D'],
    S31: ['#572A79', '#200F2D']
  }
};

export const defaultColors: CircleColorType = ['#1A1919', '#575757'];
export const selectedStrokeColor = '#FFFFFF';
export default colorConfig;



// WEBPACK FOOTER //
// ./app/config/colors.js