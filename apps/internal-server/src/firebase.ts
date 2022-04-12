import * as admin from 'firebase-admin';
import { applicationDefault } from 'firebase-admin/app';

admin.initializeApp({
    credential: applicationDefault(),
});
const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
