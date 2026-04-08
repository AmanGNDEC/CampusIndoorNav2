/* ═══════════════════════════════════════════════
   CampusNav Service Worker
   - Caches core files for offline/standalone use
   - Handles notification click → opens map.html
═══════════════════════════════════════════════ */

const CACHE = 'campusnav-v2';
const PRECACHE = [
  '/',
  '/index.html',
  '/select.html',
  '/map.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

/* ── Install: cache core files ── */
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return Promise.allSettled(PRECACHE.map(url => cache.add(url)));
    })
  );
});

/* ── Activate: clear old caches, claim clients ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: serve from cache, fall back to network ── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

/* ── Notification click: open map.html (works cross-app on Android + iOS PWA) ── */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const key    = (event.notification.data && event.notification.data.building) || '';
  const target = 'map.html' + (key ? '?building=' + key : '');

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      /* If app is already open — focus and navigate */
      for (const client of list) {
        if ('focus' in client) {
          client.focus();
          return client.navigate(target);
        }
      }
      /* Otherwise open a fresh window */
      return self.clients.openWindow(target);
    })
  );
});
