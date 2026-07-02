import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const listeners = new Map();
const cachedBodies = [];

globalThis.self = {
  location: { origin: 'https://b2bindustrial.in' },
  clients: { claim: async () => {} },
  skipWaiting: async () => {},
  addEventListener(type, listener) { listeners.set(type, listener); },
};

globalThis.caches = {
  async keys() { return []; },
  async match() { return undefined; },
  async open() {
    return {
      async addAll() {},
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
assert.equal(typeof listeners.get('fetch'), 'function', 'fetch handler must be registered');

let responsePromise;
listeners.get('fetch')({
  request: { method: 'GET', mode: 'cors', url: 'https://b2bindustrial.in/css/core.css' },
  respondWith(promise) { responsePromise = promise; },
});

const response = await responsePromise;
assert.equal(await response.text(), 'fresh asset', 'original network response must remain readable');
await new Promise((resolve) => setTimeout(resolve, 0));
assert.deepEqual(cachedBodies, ['fresh asset'], 'cloned response must remain readable by the cache');

console.log('Service worker check passed: network and cached response bodies are independently readable.');
