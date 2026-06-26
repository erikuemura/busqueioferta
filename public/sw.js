// Service worker do busqueioferta — habilita instalação (PWA) e offline básico.
const CACHE = "bo-cache-v1";
const OFFLINE_SHELL = "/";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(OFFLINE_SHELL))
      .catch(() => {}),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // não interfere em API/admin
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) return;

  // Navegações: network-first com fallback ao shell em offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match(req).then((r) => r || caches.match(OFFLINE_SHELL))),
    );
    return;
  }

  // Estáticos: cache-first.
  if (/\/_next\/static\/|\/icon-|\/favicon|\.(?:png|jpg|jpeg|svg|webp|css|js|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((resp) => {
            const copy = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            return resp;
          }),
      ),
    );
  }
});
