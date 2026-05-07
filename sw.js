// Service Worker for Prime Cut Barbershop PWA
const CACHE_NAME = 'prime-cut-v1';
const STATIC_CACHE = 'prime-cut-static-v1';
const DYNAMIC_CACHE = 'prime-cut-dynamic-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/static/js/app.js',
  '/static/prime_cut_logo.png',
  '/static/icons/icon-72x72.png',
  '/static/icons/icon-96x96.png',
  '/static/icons/icon-128x128.png',
  '/static/icons/icon-144x144.png',
  '/static/icons/icon-152x152.png',
  '/static/icons/icon-192x192.png',
  '/static/icons/icon-384x384.png',
  '/static/icons/icon-512x512.png'
];

// External assets to cache
const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Poppins:wght@300;400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('[Service Worker] Caching external assets');
        return cache.addAll(EXTERNAL_ASSETS);
      })
    ]).then(() => {
      console.log('[Service Worker] Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Now ready to handle fetches');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip cross-origin requests that are not allowed
  if (url.origin !== self.location.origin && !EXTERNAL_ASSETS.includes(event.request.url)) {
    return event.respondWith(fetch(event.request));
  }

  // For HTML requests - network first with cache fallback
  if (event.request.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('/');
          });
        })
    );
    return;
  }

  // For static assets - cache first with network fallback
  if (STATIC_ASSETS.includes(url.pathname) || EXTERNAL_ASSETS.includes(event.request.url)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }

  // For images and API - network with cache fallback
  if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/) ||
      event.request.url.includes('unsplash.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Default: network first with cache fallback
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Background Sync for offline bookings
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    console.log('[Service Worker] Syncing offline bookings');
    event.waitUntil(syncBookings());
  }
});

// Function to sync offline bookings
async function syncBookings() {
  const cache = await caches.open('offline-bookings');
  const requests = await cache.keys();

  const syncPromises = requests.map(async (request) => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.delete(request);
        console.log('[Service Worker] Booking synced successfully');
      }
    } catch (error) {
      console.error('[Service Worker] Failed to sync booking:', error);
    }
  });

  return Promise.all(syncPromises);
}

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time for a fresh cut! 🎯',
    icon: '/static/icons/icon-192x192.png',
    badge: '/static/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'book',
        title: 'Book Now',
        icon: '/static/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/static/icons/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Prime Cut ✂️', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'book') {
    event.waitUntil(
      clients.openWindow('/#booking')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});