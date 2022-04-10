import * as admin from 'firebase-admin';
import { applicationDefault } from 'firebase-admin/app';

admin.initializeApp({
    credential: applicationDefault(),
});
const db = admin.firestore();

export { db };
