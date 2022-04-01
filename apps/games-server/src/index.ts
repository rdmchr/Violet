import express from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { client_email as clientEmail, private_key as privateKey, project_id as projectId } from '../firebase.json'
import cors from 'cors';
import tictactoe from './routes/tictactoe'
import authMiddleware from './middlewares/auth';

initializeApp({
    credential: cert({
        clientEmail,
        privateKey,
        projectId
    })
});

declare module 'express-serve-static-core' {
    interface Request {
        user?: DecodedIdToken
    }
}

const auth = getAuth();
const db = getFirestore();
const port = process.env.PORT || 4000;
const app = express();
app.use(express.json());
app.use(cors())
app.use(authMiddleware);
// hide X-Powered-By header
app.use(function (req, res, next) {
    res.setHeader('X-Powered-By', 'rdmchr eSports')
    next()
})
app.use(tictactoe)


app.listen(port, () => console.log(`Games server started on port ${port}.`));

export {
    db,
    auth
}