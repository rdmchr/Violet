import express from 'express';
import { CollectionReference } from 'firebase-admin/firestore';
import { auth, db } from '../firebase';
import { User, UserData } from '../types';
import { isAdmin } from '../utils';

const router = express.Router();

router.get('/user/:uid', async (req: express.Request, res: express.Response) => {
    const token = req.headers.token as string;
    let uid = '';
    try {
        const user = await auth.verifyIdToken(token);
        uid = user.uid;
    } catch (_) {
        res.status(401).send('Unauthorized');
        return;
    }
    if (!isAdmin(uid)) {
        res.status(403).send('Forbidden');
        return;
    }
    const userDataCollection = db.collection('userData') as CollectionReference<UserData>;
    let email = '';
    let emailVerified = false;
    let disabled = false;
    try {
        const authUser = await auth.getUser(req.params.uid);
        email = authUser.email as string;
        emailVerified = authUser.emailVerified;
        disabled = authUser.disabled;
    } catch (_) {
        res.status(404).send('User not found');
        return;
    }
    const userData = await userDataCollection.doc(req.params.uid).get();
    const user: User = {
        uid: req.params.uid,
        name: userData.data()?.name || '',
        email,
        emailVerified,
        disabled,
        lastSeen: userData.data()?.lastSeen?.toDate().getTime() || null
    }
    return res.send(user).status(200);
});

export default router;