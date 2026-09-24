// Service worker para la PWA.
//
// Estrategia:
//  - Navegaciones (HTML): NETWORK-FIRST. Imprescindible en Next.js, porque el
//    HTML referencia chunks JS/CSS con hash que cambian en cada deploy. Si
//    sirviéramos HTML cacheado, apuntaría a archivos que ya no existen y la web
//    saldría rota o sin estilos. Solo caemos a la caché si no hay red (offline).
//  - Assets con hash (/_next/static/...): CACHE-FIRST, son inmutables.
//  - Llamadas a /api/: siempre red (son datos en vivo).

const CACHE_NAME = "hevy-progress-v3";
const OFFLINE_FALLBACK = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll([
          "/manifest.json",
          "/favicon.ico",
          "/icon-192.png",
          "/icon-512.png",
          "/apple-icon.png",
        ])
      )
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 1. Datos en vivo: siempre red
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(JSON.stringify({ error: "Sin conexión" }), {
            headers: { "Content-Type": "application/json" },
            status: 503,
          })
      )
    );
    return;
  }

  // 2. Navegación (HTML): network-first
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || (await caches.match(OFFLINE_FALLBACK)) || Response.error();
        })
    );
    return;
  }

  // 3. Assets inmutables de Next e iconos: cache-first
  const isHashedAsset =
    url.pathname.startsWith("/_next/static/") ||
    /\.(png|ico|svg|webp|woff2?)$/.test(url.pathname) ||
    url.pathname === "/manifest.json";

  if (isHashedAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(request, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  // 4. Todo lo demás: red con respaldo en caché
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
