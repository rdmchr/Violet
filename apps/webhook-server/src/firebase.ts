import { applicationDefault, cert, initializeApp, ServiceAccount} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';

import serviceAccount from "./gcloud-service-account.json";

const app = initializeApp({
    credential: cert(serviceAccount as ServiceAccount)
})

const db = getFirestore(app);
const auth = getAuth(app);

export {
    db,
    auth
}