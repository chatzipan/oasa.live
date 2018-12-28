/*
 * Creates an image element
 */
export default function(dataUri) {
  const image = new Image()

  return new Promise((resolve, reject) => {
    image.addEventListener('load', () => resolve(image), { once: true })
    image.addEventListener('error', error => reject(error), {
      once: true,
    })

    image.src = dataUri
  })
}
