const withTM = require("next-transpile-modules")([]);

module.exports = withTM({
  reactStrictMode: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
});
