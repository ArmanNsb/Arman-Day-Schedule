const CACHE_NAME = 'arman-day-schedule-v2';
const APP_PATH = '/Arman-Day-Schedule/';

const APP_FILES = [
  APP_PATH,
  APP_PATH + 'index.html',
  APP_PATH + 'manifest.webmanifest?v2',
  APP_PATH + 'icon-180.png?v2',
  APP_PATH + 'icon-192.png?v2',
  APP_PATH + 'icon-512.png?v2',
  APP_PATH + 'icon-maskable-192.png?v2',
  APP_PATH + 'icon-maskable-512.png?v2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (
    event.request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(APP_PATH)
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, copy);
        });
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) =>
          cached || caches.match(APP_PATH + 'index.html')
        )
      )
  );
});
