import iconConfig, { defaultIcon } from '../config/icons'

/*
 * Get the icon of a given track.
 */
export default function getIcon(track) {
  const trackIcon = iconConfig.find(icon => {
    icon.name = icon.name.replace('_', '')
    const routeMatches = icon.name === track.routeName
    const typeMatches = icon.name === track.type
    return routeMatches || typeMatches
  })
  return trackIcon || defaultIcon
}
