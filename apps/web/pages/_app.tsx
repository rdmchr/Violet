import '../style/global.css'
import type { AppProps } from 'next/app'
import { UserContext } from '../lib/context';
import {getAuth, User} from 'firebase/auth';
import { useState } from 'react';
import { app } from '../lib/firebase';

function MyApp({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firebase = app; // initialize firebase
  // manage auth state
  const auth = getAuth().onAuthStateChanged(user => {
    if (user) {
      setUser(user);
    } else {
      setUser(null);
    }
    setLoading(false);
  });

  return (
    <UserContext.Provider value={{ user: user, username: "user.displayName", uid: user?.uid, loading: loading }}>
      <Component {...pageProps} />
    </UserContext.Provider>
  );
}

export default MyApp
