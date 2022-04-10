import { app } from '../lib/firebase'
import { getAuth, signInWithPopup, EmailAuthProvider, signInWithEmailAndPassword } from 'firebase/auth'
import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions'
import Router, { useRouter } from 'next/router';
import Header from '../components/header';
import { Trans } from '@lingui/macro';
import Link from 'next/link';

const auth = getAuth(app);
const functions = getFunctions(app);

export default function Login(props) {
    const user = null;
    const username = null;

    return (
        <main>
            <Header small />
            <SignInForm />
        </main>
    )
}

function SignInForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function signIn(e) {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
            router.push('/');
            console.log(userCredential.user);
        }).catch((error) => {
            console.log(`[${error.code}]: ${error.message}`);
        });
    }

    return (
        <div>
            <div className='w-screen absolute top-1/2 left-0 -translate-y-1/2'>
                <h1 className='text-center text-2xl font-semibold mb-2'><Trans id="logIn">Log in</Trans></h1>
                <form onSubmit={signIn} className='flex flex-col px-3'>
                    <label className='flex flex-col font-semibold'>
                        <span className='ml-1'><Trans id="email">Email</Trans></span>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className='border-2 border-black rounded-lg text-xl px-1 py-1' />
                    </label>
                    <label className='flex flex-col font-semibold mt-2'>
                        <span className='ml-1'><Trans id="password">Password</Trans></span>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className='border-2 border-black rounded-lg text-xl px-1 py-1' />
                    </label>
                    <button type='submit' className='border-2 border-black mt-3 rounded-lg py-1 text-lg font-semibold border-violet-800'><Trans id="logIn">Log in</Trans></button>
                </form>
            </div>
            <div className='text-center absolute bottom-2 left-1/2 -translate-x-1/2'>
                <h1><Trans id="newHere">New here?</Trans></h1>
                <Link passHref href="/welcome"><p className='font-semibold text-lg underline -mt-1'><Trans>Sign up</Trans></p></Link>
            </div>
        </div>
    );
}
