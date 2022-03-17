import { app } from '../lib/firebase'
import { getAuth, signInWithPopup, EmailAuthProvider, signInWithEmailAndPassword } from 'firebase/auth'
import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions'

const auth = getAuth(app);
const functions = getFunctions(app);

export default function Login(props) {
    const user = null;
    const username = null;

    function fetchTimetable() {
        const fetchTimetable = httpsCallable(functions, 'fetchTimeTable');
        fetchTimetable().then(result => {
            console.log(result);
        }).catch((error) => {
            console.log(error);
        });
    }

    return (
        <main>
            {user ?
                <SignOutButton /> : <SignInForm />}
            <button onClick={fetchTimetable}>Trigger function</button>
            <SignOutButton />
        </main>
    )
}

function SignOutButton() {
    return <button onClick={() => auth.signOut()}>Sign Out</button>;
}

function SignInForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function signIn(e) {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
            console.log(userCredential.user);
        }).catch((error) => {
            console.log(`[${error.code}]: ${error.message}`);
        });
    }

    return (
        <form onSubmit={signIn}>
            <label>
                Email
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <label>
                Password
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </label>
            <button type='submit'>Sign In</button>
        </form>
    );
}

function SignInButton() {
    const provider = new EmailAuthProvider();
    /* const provider = new GoogleAuthProvider()
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly'); */
    const signInWithGoogle = async () => {
        await signInWithPopup(auth, provider);
    };

    return (
        <button className="btn-google" onClick={signInWithGoogle}>
            <img src={'/google.png'} /> Sign in with Google
        </button>
    );
}