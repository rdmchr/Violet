export const config = {
 "catalogs": [{
   "path": "translations/locale/{locale}/messages",
   "include": ["pages"],
   "exclude": ["**/node_modules/**"]
 }],
 "compileNamespace": "cjs",
 "extractBabelOptions": {},
 "compilerBabelOptions": {},
 "fallbackLocales": {},
 "format": "po",
 "locales": ["en", "de"],
 "extractors": [
  require.resolve("@lingui/cli/api/extractors/babel"),
  require.resolve("@lingui/cli/api/extractors/typescript"),
 ],
 "orderBy": "messageId",
 "pseudoLocale": "",
 "rootDir": ".",
 "runtimeConfigModule": ["@lingui/core", "i18n"],
 "sourceLocale": "en"
}
