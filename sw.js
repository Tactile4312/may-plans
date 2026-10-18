// Keeps the planner opening fast and working offline. Your saved plan lives in Firebase, not here.
const CACHE = "our-may-v2";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
const CDN = /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com|www\.gstatic\.com\/firebasejs)\//;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // Your own files: try the network first so updates show right away, fall back to the saved copy offline.
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    }).catch(() => caches.match(req).then(m => m || caches.match("./index.html"))));
    return;
  }
  if (CDN.test(req.url)) {
    // Fonts and libraries never change at a fixed version: use the saved copy when there is one.
    e.respondWith(caches.match(req).then(m => m || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
  }
});
