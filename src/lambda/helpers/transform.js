const transformLine = line => ({
  ml: line.ml_code,
  line: line.line_code,
  sdcs: [line.sdc_code],
  id: line.line_id,
  descr: line.line_descr,
  descr_en: line.line_descr_eng,
})

const transformRoute = route => ({
  route: route.RouteCode,
  line: route.LineCode,
  descr: route.RouteDescr,
  descr_en: route.RouteDescrEng,
  type: route.RouteType,
  distance: parseFloat(route.RouteDistance / 1000),
})

const transformStop = stop => ({
  code: stop.StopCode,
  id: stop.StopID,
  descr: stop.StopDescr,
  descr_en: stop.StopDescrEng,
  street: stop.StopStreet,
  street_en: stop.StopStreetEng,
  heading: stop.StopHeading,
  lat: stop.StopLat,
  lng: stop.StopLng,
  order: stop.RouteStopOrder,
  type: stop.StopType,
  amea: stop.StopAmea,
})

module.exports = {
  transformLine,
  transformRoute,
  transformStop,
}
