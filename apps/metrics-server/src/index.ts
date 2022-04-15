import cors from 'cors';
import express from 'express';
import indexRoute from './routes/index';
import * as Sentry from "@sentry/node";

const port = process.env.PORT || 5001;
const corsUrl = process.env.CORS_URL || 'http://localhost:3000';

const DEV = process.env.NODE_ENV === 'development';
const corsOptions: cors.CorsOptions = {
    origin: DEV ? '*' : corsUrl,
    allowedHeaders: '*',
    methods: 'GET',
}

const app = express();

app.use(express.json());
app.use(cors(corsOptions))

Sentry.init({
    dsn: "https://b9072aaa3eaa436c8ab56ea5db84cf62@o1186656.ingest.sentry.io/6338423",
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: false }),
        // enable Express.js middleware tracing
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0,
});
app.use(Sentry.Handlers.requestHandler());

app.use(indexRoute);

app.use(Sentry.Handlers.errorHandler());

app.listen(port, () => console.log(`Node.js server started on port ${port}.`));