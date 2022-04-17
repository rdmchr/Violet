import Document, { Html, Head, Main, NextScript } from 'next/document'

const APP_NAME = 'Violet'
const APP_DESCRIPTION = 'The better way to access your school data.'
const APP_ICON = 'https://violet.schule/images/icon-192x192.png'

class Doc extends Document {
  static async getInitialProps(ctx) {
    return await Document.getInitialProps(ctx)
  }

  render() {
    return (
      <Html lang='en' dir='ltr'>
        <Head>
          <meta name='application-name' content={APP_NAME} />
          <meta name='apple-mobile-web-app-capable' content='yes' />
          <meta name='apple-mobile-web-app-status-bar-style' content='default' />
          <meta name='apple-mobile-web-app-title' content={APP_NAME} />
          <link rel='apple-touch-icon' sizes='180x180' href='/icons/apple-touch-icon.png' />

          <link rel='manifest' href='/manifest.json' />
          <link rel='shortcut icon' href='/favicon.ico' />
          <meta name='description' content={APP_DESCRIPTION} />
          <meta name='format-detection' content='telephone=no' />
          <meta name='mobile-web-app-capable' content='yes' />
          <meta name='theme-color' content='#4c1d95' />

          <meta name='twitter:card' content='summary' />
          <meta name='twitter:url' content='https://violet.schule' />
          <meta name='twitter:title' content={APP_NAME} />
          <meta name='twitter:description' content={APP_DESCRIPTION} />
          <meta name='twitter:image' content={APP_ICON} />
          <meta name='twitter:creator' content='@mrcrdmchr' />


          <meta property='og:type' content='website' />
          <meta property='og:title' content={APP_NAME} />
          <meta property='og:description' content={APP_DESCRIPTION} />
          <meta property='og:site_name' content={APP_NAME} />
          <meta property='og:url' content='https://violet.schule' />
          <meta property='og:image' content={APP_ICON} />

        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default Doc;