// Guarda o app no celular para funcionar sem internet.
const CACHE = "financas-v2";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const isPage = e.request.mode === "navigate";
  e.respondWith(
    caches.match(isPage ? "index.html" : e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res && (res.ok || res.type === "opaque") && (url.origin === location.origin || url.host.includes("fonts.g"))) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(isPage ? "index.html" : e.request, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
