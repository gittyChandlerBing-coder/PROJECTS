/**
 * Tally service worker.
 *
 * The app's actual data (habits, tasks, timer state, settings) is already
 * offline-first by nature — it lives in Local Storage, not behind any
 * network call. This worker's only job is making the *app shell itself*
 * (HTML/JS/CSS/icons) available without a network connection, so a repeat
 * visit — or a PWA launched from a home-screen icon on a plane — still
 * loads.
 *
 * Deliberately hand-rolled rather than generated from a build-time asset
 * manifest: Next.js content-hashes files under /_next/static/, so instead
 * of precaching a fragile hardcoded list, everything is cached at runtime
 * as it's actually requested (a "grows as you browse" shell cache).
 *
 * Bump CACHE_VERSION on any change to this file's caching logic so old
 * clients cleanly drop their previous runtime cache on next activate.
 */

const CACHE_VERSION = "tally-v1";
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("tally-") && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never intercept cross-origin calls (Firebase Auth/Firestore, Google's
  // sign-in popup, etc.) or this app's own API routes — those must always
  // reach the live network, not a cached response.
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // /_next/static/* is content-hashed by Next.js (the filename changes
  // whenever the contents do), so a cached copy is safe to treat as
  // permanently valid — cache-first with no revalidation needed.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached ?? (await cache.match("/")) ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached ?? network;
}
