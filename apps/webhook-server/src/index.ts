import express from 'express';

const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.post('/', async (req, res) => {
    console.log('received webhook', req.body);
    console.log('received body', req.body);
    console.log('received header', req.headers);
    console.log('received cookies', req.cookies);
    res.sendStatus(200);
});

app.listen(port, () => console.log(`Node.js server started on port ${port}.`));
