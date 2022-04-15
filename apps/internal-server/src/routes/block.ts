import express from 'express';
import { auth } from '../firebase';
import { isAdmin } from '../utils';

const router = express.Router();

router.post('/block', async (req: express.Request, res: express.Response) => {
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
    if (!req.body.uid) {
        res.status(400).send('Missing uid');
        return;
    }
    try {
        await auth.updateUser(req.body.uid, { disabled: true })
    } catch (_) {
        res.status(404).send('User not found');
        return;
    }
    res.sendStatus(200);
});

router.post('/unblock', async (req: express.Request, res: express.Response) => {
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
    if (!req.body.uid) {
        res.status(400).send('Missing uid');
        return;
    }
    try {
        await auth.updateUser(req.body.uid, { disabled: false })
    } catch (_) {
        res.status(404).send('User not found');
        return;
    }
    res.sendStatus(200);
});

export default router;