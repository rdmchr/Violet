'use strict'

// Workbox RuntimeCaching config: https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.RuntimeCachingEntry
module.exports = [
    {
        urlPattern: ({ url }) => {
            const isSameOrigin = self.origin === url.origin;
            return isSameOrigin;
        },
        handler: 'CacheFirst',
        options: {
            cacheName: 'cache-all-local',
            expiration: {
                maxEntries: 64,
                maxAgeSeconds: 60 * 60 // 1 hour
            },
            networkTimeoutSeconds: 10
        }
    }
]
