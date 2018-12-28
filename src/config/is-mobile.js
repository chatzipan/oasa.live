const matches =
  typeof window !== 'undefined'
    ? window.matchMedia('screen and (max-width: 480px)').matches
    : true

export default matches
