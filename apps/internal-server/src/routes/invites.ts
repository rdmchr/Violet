import express from 'express';
import { CollectionReference, Query } from 'firebase-admin/firestore';
import { db, auth } from '../firebase';
import { Invite, InviteData } from '../types';
import { isAdmin } from '../utils';

const router = express.Router();

router.get('/invites', async (req: express.Request, res: express.Response) => {
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
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const invitesCollection = db.collection('invites') as CollectionReference<InviteData>;
    const invitesSnapshot = await invitesCollection.orderBy('createdAt', 'desc').limit(limit).get();
    const invites: Invite[] = [];
    for (let i = 0; i < invitesSnapshot.docs.length; i++) {
        const doc = invitesSnapshot.docs[i];
        const data = doc.data();
        if (!data) return;
        let creatorEmail = null;
        try {
            creatorEmail = (await auth.getUser(data.createdBy))?.email as string;
        } catch (_) {
            creatorEmail = 'Unknown';
        }
        let usedByEmail = null;
        if (data.usedBy)
            try {
                usedByEmail = (await auth.getUser(data.usedBy))?.email as string;
            } catch (_) {
                usedByEmail = 'Unknown';
            }
        const invite: Invite = {
            id: doc.id,
            createdAt: data.createdAt?.toDate().getTime() || 0,
            expiresAt: data.expiresAt?.toDate().getTime() || 0,
            usedAt: data.usedAt?.toDate().getTime() || null,
            usedById: data.usedBy || null,
            createdById: data.createdBy || '',
            createdByEmail: creatorEmail,
            usedByEmail
        };
        invites.push(invite);
    }
    return res.send(invites).status(200);
});

export default router;