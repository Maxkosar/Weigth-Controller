// Service worker de FitControl Pro.
// Sube CACHE_NAME cada vez que cambies index.html u otros assets para que
// los usuarios reciban la versión nueva (el SW borra las cachés viejas al activarse).
const CACHE_NAME = "fitcontrol-v1";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // add() individual con catch: si un asset falla (ej. sin conexión la
      // primera vez), no rompe la instalación completa del service worker.
      Promise.all(CORE_ASSETS.map((url) => cache.add(url).catch(() => {})))
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Navegación (abrir/recargar la app): red primero, y si no hay conexión,
  // se sirve el index.html cacheado (single-page app).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Resto de assets (CSS inline, íconos, Chart.js desde CDN, etc.):
  // stale-while-revalidate — responde con lo cacheado al instante si existe,
  // y en paralelo actualiza la caché con la versión de red para la próxima vez.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && (response.status === 200 || response.type === "opaque")) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
