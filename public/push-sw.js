// Push notification event handlers for Report The Reef
// This file is imported by the main service worker

self.addEventListener('push', function(event) {
  console.log('[Push SW] Push event received');

  if (!event.data) {
    console.log('[Push SW] No data in push event');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('[Push SW] Error parsing push data:', e);
    data = { title: 'Report The Reef', body: event.data.text() };
  }

  const options = {
    body: data.body || 'You have a new message',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    tag: data.tag || 'default',
    renotify: true,
    data: {
      url: data.url || '/connect',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  console.log('[Push SW] Showing notification:', data.title, options);

  event.waitUntil(
    self.registration.showNotification(data.title || 'Report The Reef', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Push SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'dismiss') {
    console.log('[Push SW] Notification dismissed');
    return;
  }

  const url = event.notification.data?.url || '/connect';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Try to focus an existing window
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          console.log('[Push SW] Focusing existing window');
          return client.focus();
        }
      }
      // Open a new window if none found
      console.log('[Push SW] Opening new window:', url);
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('[Push SW] Notification closed');
});

console.log('[Push SW] Push service worker loaded');
