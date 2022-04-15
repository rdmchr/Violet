import express from 'express';
import { auth } from '../firebase';
import { isAdmin } from '../utils';

const router = express.Router();

router.post('/resetPassword', async (req: express.Request, res: express.Response) => {
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
    if (!req.body.email) {
        res.status(400).send('Missing email');
        return;
    }
    try {
        const link = await auth.generatePasswordResetLink(req.body.email);
        res.send({ link });
        return;
    } catch (_) {
        res.status(404).send('User not found');
        return;
    }
});

export default router;