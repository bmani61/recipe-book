// Offline cache for the recipe book: network first so updates show up, cached copy when offline.
// ponytail: caches every GET it sees (page, icons, Google Fonts); fine for one small page, add a size cap if more pages appear.
const CACHE = "banana-leaf-v1";
const CORE = ["./", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-180.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      // filter links like ?meal=lunch all fall back to the cached page
      .catch(() => caches.match(e.request, {ignoreSearch: true}))
  );
});
