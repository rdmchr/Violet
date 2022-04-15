import express from 'express';
import { db, auth } from '../firebase';
import { CollectionReference, Timestamp } from 'firebase-admin/firestore';

const router = express.Router();

router.get('/', async(req: express.Request, res: express.Response) => {
    const token = req.headers.token as string;
    let uid = '';
    try {
        const user = await auth.verifyIdToken(token);
        uid = user.uid;
    } catch (_) {
        res.status(401).send('Unauthorized');
        return;
    }
    if (!uid) {
        res.status(401).send('Unauthorized');
        return;
    }
    const userDataCollection = db.collection('userData') as CollectionReference;
    await userDataCollection.doc(uid).update({
        lastSeen: Timestamp.now(),
    });
    return res.sendStatus(200);
});

export default router;
