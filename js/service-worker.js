const LEGACY_CACHE_PREFIX = "yamaden-support";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith(LEGACY_CACHE_PREFIX)).map(key => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then(clients => clients.forEach(client => client.navigate(client.url)))
  );
});

self.addEventListener("fetch", () => {});
