import express from 'express';
import cors from 'cors';

import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

import blockRoute from './routes/block';
import resetPasswordRoute from './routes/resetPassword';
import invitesRoute from './routes/invites';
import createInviteRoute from './routes/createInvite';
import userRoute from './routes/user';

const port = process.env.PORT || 4001;
const corsUrl = process.env.CORS_URL || 'http://localhost:4000';

const DEV = process.env.NODE_ENV === 'development';
const corsOptions: cors.CorsOptions = {
    origin: DEV ? '*' : corsUrl,
    allowedHeaders: '*',
    methods: 'GET,POST',
}

console.log(DEV ? 'You are running in a development environment. CORS will be disabled.' : 'You are running in a production environment. CORS only be allowed from ' + corsUrl);

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.use(blockRoute);
app.use(resetPasswordRoute);
app.use(invitesRoute);
app.use(createInviteRoute);
app.use(userRoute);

app.get('/', (_req: any, res: any) => {
    res.sendStatus(200);
});


if (!DEV) {
    Sentry.init({
        dsn: "https://99def82eebb24e4a94cfc298e3039286@o1186656.ingest.sentry.io/6334739",
        integrations: [
            // enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),
            // enable Express.js middleware tracing
            new Tracing.Integrations.Express({ app }),
        ],

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
    });

    // RequestHandler creates a separate execution context using domains, so that every
    // transaction/span/breadcrumb is attached to its own Hub instance
    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());

    // The error handler must be before any other error middleware and after all controllers
    app.use(Sentry.Handlers.errorHandler());
}


app.listen(port, () => console.log(`Node.js server started on port ${port}.`));
