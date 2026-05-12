const CACHE_NAME = "yamaden-support-auth-v49";

const APP_SHELL = [
  "/",
  "/index.html",
  "/css/main.css",
  "/css/auth.css",
  "/js/app.js",
  "/js/auth.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

const API_PATHS = [
  "/admin",
  "/user",
  "/request",
  "/requests"
];

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  const isApiRequest = API_PATHS.some(path => {
    return url.pathname === path || url.pathname.startsWith(path + "/");
  });

  if (isApiRequest) {
    event.respondWith(fetch(request));
    return;
  }

  if (
    request.mode === "navigate" ||
    url.pathname === "/" ||
    url.pathname.endsWith(".html")
  ) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("/index.html", copy));
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      });
    })
  );
});
