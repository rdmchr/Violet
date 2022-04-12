import cors from 'cors';
import express from 'express';
import indexRoute from './routes/index';

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

app.use(indexRoute);

app.listen(port, () => console.log(`Node.js server started on port ${port}.`));