import '../style/global.css'
import type { AppProps } from 'next/app'
import { UserContext } from '../lib/context';
import { getAuth, User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { app } from '../lib/firebase';
import { getFirestore } from 'firebase/firestore';
import { ChatIcon, HomeIcon, HornIcon, TableIcon } from '../icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core'
import { initTranslation } from '../lib/transUtil';
import { Trans } from '@lingui/macro'

const db = getFirestore(app);
const auth = getAuth(app);

initTranslation(i18n);
i18n.activate('en');

function MyApp({ Component, pageProps }: AppProps) {
  const firebase = app; // initialize firebase
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<string>('');
  const locale = router.locale || router.defaultLocale!
  const firstRender = useRef(true)

  // run only once on the first render (for server side)
  if (pageProps.translation && firstRender.current) {
    i18n.load(locale, pageProps.translation)
    i18n.activate(locale)
    firstRender.current = false
  }

  useEffect(() => {
    if (pageProps.translation) {
      i18n.load(locale, pageProps.translation)
      i18n.activate(locale)
    }
  }, [locale, pageProps.translation])

  // manage auth state
  const auth = getAuth().onAuthStateChanged(async (u) => {
    if (u === user) return;
    if (user) {
      setUser(u);
      setLoading(false);
    } else {
      setUser(null);
      setLoading(false);

    }
  });

  useEffect(() => {
    if (router) {
      if (route !== router.pathname) {
        setRoute(router.pathname);
      }
      router.events.on('routeChangeStart', (url) => {
        setRoute(url);
      })
    }
  }, [router, route]);

  const hiddenMenuRoutes = ['/login', '/settings', '/welcome']

  return (
    <>
      <I18nProvider i18n={i18n}>
        <UserContext.Provider value={{ user: user, username: "asd", uid: user?.uid, loading: loading }}>
          <Head>
            <title>Violet</title>
          </Head>
          <div>
            <Component {...pageProps} />
            <nav className={`fixed bottom-0 left-0 w-screen py-2 flex items-center justify-evenly border-t rounded-t-xl border-gray-300 drop-shadow-[0_-5px_25px_rgba(0,0,0,0.15)] bg-white ${hiddenMenuRoutes.includes(route) ? 'hidden' : 'asdasdasd'}`}>
              <Link passHref href="/">
                <div>
                  <HomeIcon className={`text-3xl ${route === "/" ? "fill-violet-800" : ""}`} />
                  <p className='text-xs'><Trans id='home'>Home</Trans></p>
                </div>
              </Link>
              <Link passHref href="/timetable">
                <div className='flex justify-center items-center flex-col'>
                  <TableIcon className={`text-3xl ${route === "/timetable" ? "fill-violet-800" : ""}`} />
                  <p className='text-xs'><Trans id='timetable'>Timetable</Trans></p>
                </div>
              </Link>
              <Link passHref href="/">
                <div className='flex justify-center items-center flex-col'>
                  <HornIcon className={`text-3xl ${route === "/news" ? "fill-violet-800" : ""}`} />
                  <p className='text-xs'><Trans id='news'>News</Trans></p>
                </div>
              </Link>
              <Link passHref href="/">
                <div className='flex justify-center items-center flex-col'>
                  <ChatIcon className={`text-3xl ${route === "/chats" ? "fill-violet-800" : ""}`} />
                  <p className='text-xs'><Trans id='chats'>Chats</Trans></p>
                </div>
              </Link>
            </nav>
          </div>
        </UserContext.Provider>
      </I18nProvider>
    </>
  );
}

export default MyApp;
