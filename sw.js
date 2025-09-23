// Service Worker for Bundesliga Web
// Implements caching strategies for better performance

const CACHE_NAME = 'bundesliga-web-v1';
const STATIC_CACHE = 'bundesliga-static-v1';
const DYNAMIC_CACHE = 'bundesliga-dynamic-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/performance.js',
    '/imagenes/bayern.svg',
    '/imagenes/dortmund.svg',
    '/imagenes/leipzig.svg',
    '/imagenes/leverkusen.svg',
    '/imagenes/frankfurt.svg',
    '/imagenes/gladbach.svg',
    '/imagenes/wolfsburg.svg',
    '/imagenes/freiburg.svg',
    '/imagenes/hoffenheim.svg',
    '/imagenes/augsburg.svg',
    '/imagenes/nuremberg.svg',
    '/imagenes/hamburgo.svg',
    '/imagenes/schalke.svg',
    '/imagenes/stuttgart.svg',
    '/imagenes/bremen.svg',
    '/imagenes/kaiserslautern.svg',
    '/imagenes/colonia.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        handleRequest(request)
    );
});

// Handle different types of requests with appropriate caching strategies
async function handleRequest(request) {
    const url = new URL(request.url);
    
    // Strategy 1: Cache First for static assets (HTML, CSS, JS, Images)
    if (isStaticAsset(request)) {
        return cacheFirst(request);
    }
    
    // Strategy 2: Network First for API calls and dynamic content
    if (isDynamicContent(request)) {
        return networkFirst(request);
    }
    
    // Strategy 3: Stale While Revalidate for fonts and external resources
    if (isExternalResource(request)) {
        return staleWhileRevalidate(request);
    }
    
    // Default: Network First
    return networkFirst(request);
}

// Cache First Strategy - for static assets
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache First failed:', error);
        
        // Return offline fallback if available
        return getOfflineFallback(request);
    }
}

// Network First Strategy - for dynamic content
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline fallback
        return getOfflineFallback(request);
    }
}

// Stale While Revalidate Strategy - for external resources
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Fetch in background to update cache
    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch((error) => {
            console.log('Background fetch failed:', error);
        });
    
    // Return cached version immediately, or wait for network
    return cachedResponse || fetchPromise;
}

// Check if request is for static assets
function isStaticAsset(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    return (
        pathname.endsWith('.html') ||
        pathname.endsWith('.css') ||
        pathname.endsWith('.js') ||
        pathname.endsWith('.svg') ||
        pathname.endsWith('.png') ||
        pathname.endsWith('.jpg') ||
        pathname.endsWith('.jpeg') ||
        pathname.endsWith('.webp') ||
        pathname === '/'
    );
}

// Check if request is for dynamic content
function isDynamicContent(request) {
    const url = new URL(request.url);
    
    return (
        url.pathname.includes('/api/') ||
        url.pathname.includes('/data/') ||
        url.search.includes('timestamp') ||
        url.search.includes('cache-bust')
    );
}

// Check if request is for external resources
function isExternalResource(request) {
    const url = new URL(request.url);
    
    return (
        url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com') ||
        url.hostname.includes('cdn.') ||
        url.hostname !== self.location.hostname
    );
}

// Get offline fallback for different resource types
async function getOfflineFallback(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // HTML fallback
    if (request.headers.get('accept').includes('text/html')) {
        const cachedPage = await caches.match('/index.html');
        if (cachedPage) {
            return cachedPage;
        }
        
        return new Response(
            `<!DOCTYPE html>
            <html>
            <head>
                <title>Offline - Bundesliga Web</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .offline-message { max-width: 500px; margin: 0 auto; }
                    .offline-icon { font-size: 64px; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="offline-message">
                    <div class="offline-icon">⚽</div>
                    <h1>Sin conexión</h1>
                    <p>No hay conexión a internet. Por favor, verifica tu conexión e intenta nuevamente.</p>
                    <button onclick="window.location.reload()">Reintentar</button>
                </div>
            </body>
            </html>`,
            {
                headers: { 'Content-Type': 'text/html' }
            }
        );
    }
    
    // Image fallback
    if (pathname.endsWith('.svg') || pathname.endsWith('.png') || pathname.endsWith('.jpg')) {
        return new Response(
            `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="#f0f0f0"/>
                <text x="50" y="45" font-family="Arial, sans-serif" font-size="10" fill="#999" text-anchor="middle">Imagen</text>
                <text x="50" y="60" font-family="Arial, sans-serif" font-size="10" fill="#999" text-anchor="middle">no disponible</text>
            </svg>`,
            {
                headers: { 'Content-Type': 'image/svg+xml' }
            }
        );
    }
    
    // Generic fallback
    return new Response('Recurso no disponible offline', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Perform background sync operations
async function doBackgroundSync() {
    try {
        // Sync any pending data or actions
        console.log('Performing background sync...');
        
        // Example: Sync user interactions, analytics, etc.
        // This would be implemented based on specific app needs
        
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push notification handling
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/imagenes/bayern.svg',
        badge: '/imagenes/bayern.svg',
        vibrate: [100, 50, 100],
        data: data.data,
        actions: [
            {
                action: 'explore',
                title: 'Ver más',
                icon: '/imagenes/bayern.svg'
            },
            {
                action: 'close',
                title: 'Cerrar'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
        event.waitUntil(syncContent());
    }
});

// Sync content in background
async function syncContent() {
    try {
        console.log('Syncing content in background...');
        
        // Example: Update team standings, news, etc.
        // This would fetch fresh data and update caches
        
    } catch (error) {
        console.error('Content sync failed:', error);
    }
}

console.log('Service Worker loaded successfully');