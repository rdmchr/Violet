import '../style/global.css'
import type { AppProps } from 'next/app'
import { UserContext } from '../lib/context';
import { getAuth, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { app } from '../lib/firebase';
import { getFirestore } from 'firebase/firestore';
import { ChatIcon, HomeIcon, HornIcon, TableIcon } from '../icons';
import Link from 'next/link';
import { useRouter } from 'next/router';

const db = getFirestore(app);
const auth = getAuth(app);

function MyApp({ Component, pageProps }: AppProps) {
  const firebase = app; // initialize firebase
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<string>('');
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
      router.events.on('routeChangeStart', (url) => {
        setRoute(url);
      })
    }
  }, [router])

  

  return (
    <UserContext.Provider value={{ user: user, username: "asd", uid: user?.uid, loading: loading }}>
      <div>
        <Component {...pageProps} />
        <nav className='fixed bottom-0 left-0 w-screen py-2 flex items-center justify-evenly border-t rounded-t-xl border-gray-300 drop-shadow-[0_-5px_25px_rgba(0,0,0,0.15)] bg-white'>
          <Link passHref href="/">
            <div>
              <HomeIcon className={`text-3xl ${route === "/" ? "fill-violet-800" : ""}`} />
              <p className='text-xs'>Home</p>
            </div>
          </Link>
          <Link passHref href="/timetable">
            <div className='flex justify-center items-center flex-col'>
              <TableIcon className={`text-3xl ${route === "/timetable" ? "fill-violet-800" : ""}`} />
              <p className='text-xs'>Timetable</p>
            </div>
          </Link>
          <Link passHref href="/">
            <div className='flex justify-center items-center flex-col'>
              <HornIcon className={`text-3xl ${route === "/news" ? "fill-violet-800" : ""}`} />
              <p className='text-xs'>News</p>
            </div>
          </Link>
          <Link passHref href="/">
            <div className='flex justify-center items-center flex-col'>
              <ChatIcon className={`text-3xl ${route === "/chats" ? "fill-violet-800" : ""}`} />
              <p className='text-xs'>Chats</p>
            </div>
          </Link>
        </nav>
      </div>
    </UserContext.Provider>
  );
}

export default MyApp;
