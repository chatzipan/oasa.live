export default function(state) {
  const track = state.selectedTrack

  return track ? track.properties : null
}
