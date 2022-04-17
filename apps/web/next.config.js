const { withSentryConfig } = require('@sentry/nextjs');
const withPWA = require('next-pwa');
const cache = require('./cache');

const moduleExports = withPWA({
  reactStrictMode: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
  pwa: {
    dest: 'public',
    runtimeCaching: [cache]
  },
});

const sentryWebpackPluginOptions = {
  silent: true,
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
