/* eslint-disable */
const API_URL = 'http://telematics.oasa.gr/api/'
const GET_BUS_LOCATION = `${API_URL}?act=getBusLocation&p1=`
const GET_LINES = `${API_URL}?act=webGetLinesWithMLInfo`
const GET_SCHEDULE_CODES_BY_LINE = `${API_URL}?act=getScheduleDaysMasterline&p1=`
const GET_SCHEDULES_BY_LINE = `${API_URL}?act=getSchedLines&p1=mlCode&p2=sdcCode&p3=lineCode`
const GET_ROUTES_BY_LINE = `${API_URL}?act=webGetRoutes&p1=`
const GET_ROUTE_DETAILS = `${API_URL}?act=webGetRoutesDetailsAndStops&p1=`
const GET_CLOSEST_STOPS = `${API_URL}?act=getClosestStops&p1=x&p2=y`

module.exports = {
  GET_BUS_LOCATION,
  GET_CLOSEST_STOPS,
  GET_LINES,
  GET_ROUTES_BY_LINE,
  GET_ROUTE_DETAILS,
  GET_SCHEDULES_BY_LINE,
  GET_SCHEDULE_CODES_BY_LINE,
}
