import express from 'express';
import { CollectionReference, Query, Timestamp } from 'firebase-admin/firestore';
import { db, auth } from '../firebase';
import { Invite, InviteData } from '../types';
import { isAdmin } from '../utils';

const router = express.Router();

router.post('/createInvite', async (req: express.Request, res: express.Response) => {
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
    const expires = req.body.expires as number;
    if (expires < Timestamp.now().toMillis()) {
        return res.status(400).send('Invalid expires');
    }
    const invitesCollection = db.collection('invites') as CollectionReference<InviteData>;
    const invite = await invitesCollection.add({
        createdAt: Timestamp.now(),
        createdBy: uid,
        expiresAt: Timestamp.fromMillis(expires),
        usedAt: null,
        usedBy: null
    });
    return res.send({inviteId: invite.id}).status(200);
});

export default router;