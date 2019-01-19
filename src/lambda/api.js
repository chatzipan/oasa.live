const API_URL = 'http://telematics.oasa.gr/api/'

const GET_BUS_LOCATION = `${API_URL}?act=getBusLocation&p1=`
const GET_LINES = `${API_URL}?act=webGetLinesWithMLInfo`
const GET_ROUTES_PER_LINE = `${API_URL}?act=webGetRoutes&p1=`
const GET_ROUTE_DETAILS = `${API_URL}?act=webGetRoutesDetailsAndStops&p1=`
const GET_CLOSEST_STOPS = `${API_URL}?act=getClosestStops&p1=x&p2=y`

module.exports = {
  GET_BUS_LOCATION,
  GET_LINES,
  GET_ROUTES_PER_LINE,
  GET_CLOSEST_STOPS,
  GET_ROUTE_DETAILS,
}
