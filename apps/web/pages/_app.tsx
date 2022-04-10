import '../style/global.css'
import type { AppProps } from 'next/app'
import { UserContext } from '../lib/context';
import { getAuth, User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { app } from '../lib/firebase';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { ChatIcon, HomeIcon, HornIcon, TableIcon } from '../icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core'
import { initTranslation } from '../lib/transUtil';
import { Trans } from '@lingui/macro'
import { useAuthState } from 'react-firebase-hooks/auth';

const db = getFirestore(app);
const auth = getAuth(app);

initTranslation(i18n);
i18n.activate('en');

function MyApp({ Component, pageProps }: AppProps) {
  const firebase = app; // initialize firebase
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

  // manage auth state
  /*   const authChange = getAuth().onAuthStateChanged(async (u) => {
      if (u === user) return;
      if (user) {
        setUser(u);
        console.log(user);
        await fetchUserData(user.uid)
        setLoading(false);
      } else {
        setUser(null);
        console.log("no user")
        setLoading(false);
  
      }
    }); */

  useEffect(() => {
    setRoute(router.pathname);
  });

  // manage user data and preferences
  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      // push to login page if no user is logged in
      if (router.pathname !== '/login' && router.pathname !== '/welcome')
        router.push('/login');
    } else {
      fetchUserData(user.uid);
      console.log(user);
    }
  }, [user, userLoading])

  async function fetchUserData(userId: string) {
    const userRef = await getDoc(doc(db, 'users', userId));
    const userData = userRef.data();
    const colorScheme = userData.colorScheme ? userData.colorScheme : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setLoadingAnimation(userData.loadingAnimation);
    setColorScheme(colorScheme);
    setName(userData.name);
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
        <UserContext.Provider value={{ user: user, name, uid: user?.uid, loading: loading, colorScheme, setColorScheme, loadingAnimation, setLoadingAnimation }}>
          <Head>
            <title>Violet</title>
            <link rel="shortcut icon" href="/favicon.ico" />
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
        </UserContext.Provider>
      </I18nProvider>
    </>
  );
}

export default MyApp;
