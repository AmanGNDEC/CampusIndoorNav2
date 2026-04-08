/* CampusNav Service Worker — handles notification clicks */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

/* When user taps the arrival notification → open map.html */
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const building = (event.notification.data && event.notification.data.building) || '';
  const target   = 'map.html' + (building ? '?building=' + building : '');

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      /* If the app is already open in a tab — focus it and navigate */
      for (const client of clientList) {
        if (client.url.includes('map.html') || client.url.includes('select.html')) {
          client.focus();
          return client.navigate(target);
        }
      }
      /* Otherwise open a new browser tab directly to map.html */
      return self.clients.openWindow(target);
    })
  );
});
