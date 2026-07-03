const CACHE_PREFIX = 'b2b-industrial-';
const CACHE = `${CACHE_PREFIX}v8`;
const scopedUrl = (path = '') => new URL(path, self.registration.scope).href;
const OFFLINE_URL = scopedUrl('offline.html');
const CORE = [
  '',
  'index.html',
  'offline.html',
  'css/core.min.css',
  'css/content.min.css',
  'css/core-pages.min.css',
  'css/responsive.min.css',
  'js/core.min.js',
  'js/core-pages.min.js',
  'assets/images/logo.webp',
  'assets/images/pwa/icon-192.webp'
].map(scopedUrl);

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => Promise.allSettled(CORE.map((url) => cache.add(url)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
      return response;
    }).catch(async () => (await caches.match(event.request)) || caches.match(OFFLINE_URL)));
    return;
  }
  const requestUrl = new URL(event.request.url);
  const preferFresh = /\.(?:css|js|webmanifest|json)$/i.test(requestUrl.pathname);
  if (preferFresh) {
    event.respondWith(fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
      }
      return response;
    }).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
    }
    return response;
  })));
});
