import '../style/global.css'
import type { AppProps } from 'next/app'
import { UserContext } from '../lib/context';
import { getAuth } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { app } from '../lib/firebase';
import { doc, enableIndexedDbPersistence, getDoc, getFirestore } from 'firebase/firestore';
import { HomeIcon, HornIcon, TableIcon } from '../icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core'
import { initTranslation } from '../lib/transUtil';
import { Trans } from '@lingui/macro'
import { useAuthState } from 'react-firebase-hooks/auth';
import posthog from 'posthog-js';
import * as Sentry from "@sentry/nextjs";

const db = getFirestore(app());
const auth = getAuth(app());

initTranslation(i18n);
i18n.activate('en');

function MyApp({ Component, pageProps }: AppProps) {
  const firebase = app(); // initialize firebase
  const router = useRouter();
  //const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<string>('');
  const locale = router.locale || router.defaultLocale!;
  const firstRender = useRef(true);
  const [user, userLoading, userError] = useAuthState(auth);
  const [colorScheme, setColorScheme] = useState<string>('dark');
  const [loadingAnimation, setLoadingAnimation] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [showingInstallPrompt, setShowingInstallPrompt] = useState<boolean>(false);
  const [installPWA, setInstallPWA] = useState(null);

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
  }, [])

  async function callMetricsServer() {
    const user = auth.currentUser;
    if (!user || !user.uid) return;
    const token = await user.getIdToken();
    const metricsUrl = 'https://metrics.violet.schule/';
    try {
      await fetch(metricsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          token
        }
      })
    } catch (e) {
      Sentry.captureException(e);
    }
  }

  function installPrompt() {
    installPWA.prompt();
    setShowingInstallPrompt(false);
    setInstallPWA(null);
  }

  function initMetrics() {
    posthog.init('phc_yuABDyS7icczuDnR0COHympZkHammRDUWcJtnpmatvJ', { api_host: 'https://lithium.violet.schule' });

    callMetricsServer();
    setInterval(callMetricsServer, 60 * 1000);
  }

  useEffect(() => {
    setRoute(router.pathname);
  });

  // manage user data and preferences
  useEffect(() => {
      if (userLoading) return;
      if (!user) {
        setupNoUser();
        // push to login page if no user is logged in
        if (router.pathname !== '/login' && router.pathname !== '/welcome')
          router.push('/login');
      } else {
        if (process.env.NODE_ENV !== 'development') {
          initMetrics();
        }
        fetchUserData(user.uid);
      }
  }, [user, userLoading]);

  // prompt user to install PWA
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // run only in browser
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        setInstallPWA(e);
        // Update UI notify the user they can add to home screen
        setShowingInstallPrompt(true);
      })
    }
  }, [])

  async function setupNoUser() {
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setColorScheme(colorScheme);
    if (colorScheme === 'dark')
      document.documentElement.classList.add('dark');
    else
      document.documentElement.classList.remove('dark');
  }

  async function fetchUserData(userId: string) {
    const userRef = await getDoc(doc(db, 'users', userId));
    const userData = userRef.data();
    const colorScheme = userData?.colorScheme ? userData.colorScheme : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setLoadingAnimation(userData?.loadingAnimation);
    setColorScheme(colorScheme);
    setName(userData?.name);
    if (colorScheme === 'dark')
      document.documentElement.classList.add('dark');
    else
      document.documentElement.classList.remove('dark');
    setLoading(false);
  }

  const hiddenMenuRoutes = ['/login', '/settings', '/welcome']

  return (
    <>
      <I18nProvider i18n={i18n}>
        <UserContext.Provider value={{ user: user, name, uid: user?.uid, loading: loading, colorScheme, setColorScheme, loadingAnimation, setLoadingAnimation, installPWA, setInstallPWA }}>
          <Head>
            <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover' />
            <title>Violet</title>
          </Head>
          <div className='grid'>
            <Component {...pageProps} />
            <nav className={`fixed -bottom-1 left-0 w-screen py-2 flex items-center justify-evenly border-t rounded-t-xl border-gray-300 dark:border-gray-700 drop-shadow-[0_-5px_25px_rgba(0,0,0,0.15)] bg ${hiddenMenuRoutes.includes(route) ? 'hidden' : ''}`}>
              <Link passHref href="/">
                <div className='flex justify-center items-center flex-col cursor-pointer'>
                  <HomeIcon className={`text-3xl ${route === "/" ? "icon-violet" : "icon"}`} />
                  <p className='text text-xs'><Trans id='home'>Home</Trans></p>
                </div>
              </Link>
              <Link passHref href="/timetable">
                <div className='flex justify-center items-center flex-col cursor-pointer'>
                  <TableIcon className={`text-3xl ${route === "/timetable" ? "icon-violet" : "icon"}`} />
                  <p className='text text-xs'><Trans id='timetable'>Timetable</Trans></p>
                </div>
              </Link>
              <Link passHref href="/news">
                <div className='flex justify-center items-center flex-col'>
                  <HornIcon className={`text-3xl ${route === "/news" ? "icon-violet" : "icon"}`} />
                  <p className='text text-xs'><Trans id='news'>News</Trans></p>
                </div>
              </Link>
              {/*-<Link passHref href="/">
                <div className='flex justify-center items-center flex-col cursor-pointer'>
                  <ChatIcon className={`text-3xl ${route === "/chats" ? "icon-violet" : "icon"}`} />
                  <p className='text text-xs'><Trans id='chats'>Chats</Trans></p>
                </div>
  </Link>*/}
            </nav>
          </div>
          {showingInstallPrompt ?
            <div className='z-10 fixed bottom-0 left-0 w-[100vw] bg border-t border-gray-500 shadow-[0_-1px_10px_3px_rgba(0,0,0,0.3)]'>
              <h1 className='text text-center text-2xl font-semibold mt-2'><Trans id="installViolet">Install Violet</Trans></h1>
              <p className='text text-center px-2'><Trans id="installDisclaimer">To use Violet offline and receive notifications, click the install button.</Trans></p>
              <div className='flex w-max mx-auto gap-x-2 my-2'>
                <button className='border-2 border-red-400 px-2 py-1 text text-lg font-medium rounded-lg' onClick={() => setShowingInstallPrompt(false)}>Cancel</button>
                <button className='border-2 border-green-400 px-2 py-1 text text-lg font-medium rounded-lg' onClick={installPrompt}>Install</button>
              </div>
            </div> : null
          }
        </UserContext.Provider>
      </I18nProvider>
    </>
  );
}

export default MyApp;
