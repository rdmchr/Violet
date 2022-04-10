import express from 'express';
import multer from 'multer';
import {
    encrypt,
    callFirebaseFunction,
    userHasInvite,
    toBase64,
} from './utils';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

const port = process.env.PORT || 8080;

const app = express();
Sentry.init({
    dsn: 'https://bb80117b6bfd4a83a44de2e173293152@o1186656.ingest.sentry.io/6306497',
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Tracing.Integrations.Express({ app }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.5,
});
// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());
// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());
app.use(express.json());
app.use(express.static(__dirname, { dotfiles: 'allow' }));

app.get('/', (_req: any, res: any) => {
    res.sendStatus(200);
});

app.post('/', multer().none(), async (_req: any, res: any) => {
    console.info('Received webhook without uid.');
    res.sendStatus(200);
});

app.post('/webhook/:uid', multer().none(), async (req: any, res: any) => {
    console.log('received body', req.body.payload);
    console.log('user id', req.params.uid);
    if (!req.body.payload) {
        console.log('no payload');
        res.sendStatus(200);
        return;
    }
    const hasInvite = await userHasInvite(req.params.uid);
    // only run function if the user was invited
    if (hasInvite) parseJson(JSON.parse(req.body.payload), req.params.uid);
    res.sendStatus(200);
});

app.listen(port, () => console.log(`Node.js server started on port ${port}.`));

//TODO: implement missing functions
async function parseJson(json: any, uid: string) {
    const encryptedUid = encrypt(toBase64(uid));
    console.log(json);
    if (json.Typ) {
        switch (json.Typ) {
            case 1:
                // there is a change in the timetable
                console.log(`Fetching timetable for user ${uid}`);
                await callFirebaseFunction('fetchTimetable', {
                    uid: encryptedUid,
                });
                break;
            case 2:
                // there is a new chat message
                break;
            case 3:
                // there is a new news message
                console.log(`Fetching news for user ${uid}`);
                await callFirebaseFunction('fetchAnnouncements', {
                    uid: encryptedUid,
                });
                break;
            case 4:
                // there is a new file
                break;
            case 5:
                // there is a new ticker message
                break;
            case 6:
                // new eva task
                break;
            case 7:
                // new video chat invitation?
                break;
            default:
                // invalid webhook type
                console.info('Invalid webhook type');
                break;
        }
    } else {
        console.info('No webhook type');
    }
}
