import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const listeners = new Map();
const cachedBodies = [];
const preCachedUrls = [];

globalThis.self = {
  location: { origin: 'https://b2bindustrial.in' },
  registration: { scope: 'https://b2bindustrial.in/b2b-new/' },
  clients: { claim: async () => {} },
  skipWaiting: async () => {},
  addEventListener(type, listener) { listeners.set(type, listener); },
};

globalThis.caches = {
  async keys() { return []; },
  async match() { return undefined; },
  async open() {
    return {
      async add(url) { preCachedUrls.push(String(url)); },
      async put(_request, response) { cachedBodies.push(await response.text()); },
    };
  },
  async delete() { return true; },
};

globalThis.fetch = async () => new Response('fresh asset', {
  status: 200,
  headers: { 'content-type': 'text/plain' },
});

vm.runInThisContext(readFileSync(new URL('../sw.js', import.meta.url), 'utf8'), { filename: 'sw.js' });
assert.equal(typeof listeners.get('install'), 'function', 'install handler must be registered');
assert.equal(typeof listeners.get('fetch'), 'function', 'fetch handler must be registered');

let installPromise;
listeners.get('install')({ waitUntil(promise) { installPromise = promise; } });
await installPromise;
assert.ok(preCachedUrls.length >= 10, 'core offline assets must be queued for caching');
assert.ok(preCachedUrls.every((url) => url.startsWith('https://b2bindustrial.in/b2b-new/')), 'precache URLs must stay inside the service-worker scope');

let responsePromise;
listeners.get('fetch')({
  request: { method: 'GET', mode: 'cors', url: 'https://b2bindustrial.in/css/core.css' },
  respondWith(promise) { responsePromise = promise; },
});

const response = await responsePromise;
assert.equal(await response.text(), 'fresh asset', 'original network response must remain readable');
await new Promise((resolve) => setTimeout(resolve, 0));
assert.deepEqual(cachedBodies, ['fresh asset'], 'cloned response must remain readable by the cache');

console.log('Service worker check passed: scoped precaching installs cleanly and network/cache response bodies remain independently readable.');
