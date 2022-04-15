import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA2h6zoG90Mwo1_JHxuYgmto8oLusb7suM",
    authDomain: "rdmchr-violet.firebaseapp.com",
    projectId: "rdmchr-violet",
    storageBucket: "rdmchr-violet.appspot.com",
    messagingSenderId: "478025473645",
    appId: "1:478025473645:web:84c412980f528ec9f2e964"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();

export { app, auth, db };