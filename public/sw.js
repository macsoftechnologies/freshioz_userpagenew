// Freshioz Progressive Web App Service Worker
const CACHE_NAME = 'freshioz-pwa-v7';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/pwa-192.png',
  '/pwa-512.png',
  '/freshioz-logo-square.png',
  '/freshioz-logo.png',
  '/favicon.svg'
];

// Install: Cache core assets for fast startup
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[PWA] Cache addAll non-fatal warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up older cache versions immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA] Deleting outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy for offline capability & instant live updates
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 1. Strictly bypass non-GET requests (POST, PUT, DELETE, PATCH, etc.)
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 2. Bypass non-HTTP(S) and backend API / upload requests
  if (!url.protocol.startsWith('http')) return;
  if (
    url.hostname.includes('api.') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/uploads')
  ) {
    return;
  }

  // 3. Navigation, HTML, Scripts & Styles: Network First (always fresh code when online)
  if (
    req.mode === 'navigate' ||
    url.pathname.match(/\.(js|css|html)$/i)
  ) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = (await caches.match(req)) || 
                         (await caches.match('/index.html')) || 
                         (await caches.match('/'));
          return cached || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // 4. Static media (images, fonts): Stale-while-revalidate for fast rendering
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2?|ico)$/i) ||
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com'
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const clone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
            return networkRes;
          })
          .catch(() => cached || new Response('', { status: 404 }));

        return cached || fetchPromise;
      })
    );
    return;
  }

  // 5. Default GET requests
  event.respondWith(
    fetch(req).catch(async () => {
      const cached = await caches.match(req);
      return cached || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
    })
  );
});

// Listen for skip waiting command
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
