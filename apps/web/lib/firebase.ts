import { initializeApp, getApps } from 'firebase/app'

const firebaseConfig = {
    apiKey: "AIzaSyA2h6zoG90Mwo1_JHxuYgmto8oLusb7suM",
    authDomain: "rdmchr-violet.firebaseapp.com",
    projectId: "rdmchr-violet",
    storageBucket: "rdmchr-violet.appspot.com",
    messagingSenderId: "478025473645",
    appId: "1:478025473645:web:94ca06c796cb4bdef2e964"
};

if (!getApps().length) {
    
}

export const app = initializeApp(firebaseConfig);
