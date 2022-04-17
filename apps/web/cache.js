'use strict'

// Workbox RuntimeCaching config: https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.RuntimeCachingEntry
module.exports = [
  {
    urlPattern: () => true,
    handler: 'CacheFirst',
    options: {
      cacheName: 'the-everything-cache',
      expiration: {
        maxEntries: 4000,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
      },
    },
  },
]