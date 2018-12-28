/**
 * Initializes the service worker.
 */
export default function() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.register('./sw.js', {scope: './'});
}



// WEBPACK FOOTER //
// ./app/lib/initialize-service-worker.js