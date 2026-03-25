const CACHE_VERSION = 3;
const STATIC_CACHE = `cali-t-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `cali-t-dynamic-v${CACHE_VERSION}`;
const IMAGE_CACHE = `cali-t-images-v${CACHE_VERSION}`;
const FONT_CACHE = `cali-t-fonts-v${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Critical assets to precache on install
const PRECACHE_URLS = [
  '/fr',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/images/logo.jpeg',
];

// Image extensions to cache separately
const IMAGE_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.svg', '.ico'];

// Font extensions
const FONT_EXTENSIONS = ['.woff', '.woff2', '.ttf', '.otf', '.eot'];

// Max items per cache
const MAX_DYNAMIC_CACHE = 50;
const MAX_IMAGE_CACHE = 80;
const MAX_FONT_CACHE = 30;

// ─── Install ────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// ─── Activate: clean old caches ─────────────────────────────────
self.addEventListener('activate', (event) => {
  const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, FONT_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => !validCaches.includes(name))
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Helper: trim cache to max size ─────────────────────────────
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    return trimCache(cacheName, maxItems);
  }
}

// ─── Helper: is image request ───────────────────────────────────
function isImageRequest(url) {
  return IMAGE_EXTENSIONS.some((ext) => url.pathname.toLowerCase().endsWith(ext));
}

// ─── Helper: is font request ───────────────────────────────────
function isFontRequest(url) {
  return FONT_EXTENSIONS.some((ext) => url.pathname.toLowerCase().endsWith(ext)) ||
         url.hostname === 'fonts.gstatic.com';
}

// ─── Helper: is static asset (JS/CSS) ──────────────────────────
function isStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css');
}

// ─── Helper: is Google Fonts CSS ────────────────────────────────
function isGoogleFontsCSS(url) {
  return url.hostname === 'fonts.googleapis.com';
}

// ─── Fetch: smart caching strategies ────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip API, auth routes
  if (url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/auth/')) return;

  // Allow Google Fonts through (don't skip external for fonts)
  const isExternal = url.origin !== self.location.origin;
  if (isExternal && !isFontRequest(url) && !isGoogleFontsCSS(url)) return;

  // ── Strategy 0: Cache-First for fonts (long-lived) ──
  if (isFontRequest(url) || isGoogleFontsCSS(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(FONT_CACHE).then((cache) => {
              cache.put(request, clone);
              trimCache(FONT_CACHE, MAX_FONT_CACHE);
            });
          }
          return response;
        }).catch(() => new Response('', { status: 404 }));
      })
    );
    return;
  }

  // ── Strategy 1: Cache-First for images ──
  if (isImageRequest(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(request, clone);
              trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE);
            });
          }
          return response;
        }).catch(() => new Response('', { status: 404 }));
      })
    );
    return;
  }

  // ── Strategy 2: Cache-First for static assets (JS/CSS) ──
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // ── Strategy 3: Network-First for pages ──
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, clone);
              trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE);
            });
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // ── Strategy 4: Stale-While-Revalidate for everything else ──
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clone);
            trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE);
          });
        }
        return response;
      }).catch(() => cached || new Response('Offline', { status: 503 }));

      return cached || networkFetch;
    })
  );
});

// ─── Messages ───────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  // Return cache stats
  if (event.data === 'getCacheStats') {
    Promise.all([
      caches.open(STATIC_CACHE).then(c => c.keys()).then(k => k.length),
      caches.open(DYNAMIC_CACHE).then(c => c.keys()).then(k => k.length),
      caches.open(IMAGE_CACHE).then(c => c.keys()).then(k => k.length),
      caches.open(FONT_CACHE).then(c => c.keys()).then(k => k.length),
    ]).then(([staticCount, dynamicCount, imageCount, fontCount]) => {
      event.source.postMessage({
        type: 'cacheStats',
        static: staticCount,
        dynamic: dynamicCount,
        images: imageCount,
        fonts: fontCount,
        version: CACHE_VERSION,
      });
    });
  }
});
