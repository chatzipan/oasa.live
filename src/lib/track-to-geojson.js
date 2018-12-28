// @flow
import type {
  Feature as FeatureType,
  FeatureCollection as FeatureCollectionType
} from 'geojson-flow';

type CoordType = [number, number];
type CoordListType = Array<CoordType>;

function featureFromCoords(coordinates: CoordListType): FeatureType {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates
    }
  };
}

function coordsFromBlock(coordBlock: string): CoordListType {
  const lines = coordBlock
    .split('\n')
    .filter((line: string): number => line.length);
  const coords = lines.map((line: string): CoordType => {
    const [lng, lat] = line.split(',');
    return [Number(lng), Number(lat)];
  });

  return coords;
}

/**
 * Converts a track CSV to a track GeoJSON.
 * @param  {string} csvString  -
 * @return {object}  The GeoJSON
 */
export default function(csvString: string): FeatureCollectionType {
  const coordBlocks = csvString.split('!');
  const featureCoords = coordBlocks.map(coordsFromBlock);
  const features = featureCoords.map(featureFromCoords);

  return {
    type: 'FeatureCollection',
    features
  };
}



// WEBPACK FOOTER //
// ./app/lib/track-to-geojson.js