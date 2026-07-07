// Tombstone service worker.
//
// A previous (static) version of this site registered a cache-first service
// worker via public/assets/script.js. Cache-first meant a returning visitor
// could be pinned to a stale cached homepage indefinitely. The current Astro
// site registers no service worker at all, and script.js has been removed —
// but browsers that visited the old site still have that worker installed.
//
// This tombstone replaces the old worker at the same URL. On its next update
// check the browser fetches this file, activates it, and it: deletes every
// cache the old worker created, unregisters itself, and reloads open clients
// — so any visitor still carrying the stale worker self-heals to the live
// site. Once enough time has passed for previously-registered clients to
// update, this file can be deleted outright.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (_) {
        /* caches API unavailable — nothing to clear */
      }
      try {
        await self.registration.unregister();
      } catch (_) {
        /* already gone */
      }
      try {
        const clients = await self.clients.matchAll({ type: 'window' });
        for (const client of clients) {
          client.navigate(client.url);
        }
      } catch (_) {
        /* navigation not permitted — the next manual reload heals it */
      }
    })(),
  );
});
