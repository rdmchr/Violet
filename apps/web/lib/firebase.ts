import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { disableNetwork, enableIndexedDbPersistence, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA2h6zoG90Mwo1_JHxuYgmto8oLusb7suM",
    authDomain: "rdmchr-violet.firebaseapp.com",
    projectId: "rdmchr-violet",
    storageBucket: "rdmchr-violet.appspot.com",
    messagingSenderId: "478025473645",
    appId: "1:478025473645:web:94ca06c796cb4bdef2e964"
};

/* let app: FirebaseApp;

export function init() {
    app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    try {
        enableIndexedDbPersistence(db);
        console.log('IndexedDB persistence is enabled');
    } catch (e) {
        console.log(e);
    }
} */

export const app = () => {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore();
    try {
        enableIndexedDbPersistence(db);
        console.log('IndexedDB persistence is enabled');
    } catch (e) {
        if (e.code !== 'failed-precondition') {
            console.log(e);
        }
    }
    return app;
};
