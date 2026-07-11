const CACHE_PREFIX = 'b2b-industrial-';
const CACHE = `${CACHE_PREFIX}v14`;
const scopedUrl = (path = '') => new URL(path, self.registration.scope).href;
const CORE = [
  '',
  'index.html',
  'css/core.css',
  'css/content.css',
  'css/core-pages.css',
  'css/responsive.css',
  'js/core.js',
  'js/core-pages.js',
  'js/tools.js',
  'css/tools.css',
  'assets/legacy-css/tools.css',
  'tools/',
  'tools/tonnage-calculator.html',
  'tools/powerfactor-calculation.html',
  'tools/luxlevel-calculator.html',
  'assets/js/tooljs/tonnage-calculator.min.js',
  'assets/js/tooljs/powerfactor-calculation.min.js',
  'assets/js/tooljs/luxlevel-calculator.min.js',
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
    }).catch(async () => (await caches.match(event.request)) || new Response('', { status: 503, statusText: 'Service Unavailable' })));
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
