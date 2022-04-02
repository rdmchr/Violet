import express from 'express';
import http from 'http';
import https from 'https'
import fs from 'fs';
import multer from 'multer';
import { db } from './firebase';
import axios from 'axios';

const app = express();
app.use(express.json());
app.use(express.static(__dirname, { dotfiles: 'allow' }));


// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/whook.radmacher.link/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/whook.radmacher.link/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/whook.radmacher.link/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

app.get('/', (req, res) => {
    res.send('ok');
});

app.post('/', multer().none(), async (req, res) => {
    console.info('Received webhook without uid.');
    res.send('ok');
});

app.post('/:uid', multer().none(), async (req, res) => {
    console.log('received body', JSON.stringify(req.body));
    console.log('user id', req.params.uid);
    //parseJson(req.body);
    res.sendStatus(200);
});

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
    console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});

function parseJson(json: any) {
    callFirebaseFunction('checkCredentials', {})
    if (json.payload) {
        switch (json.payload.Typ) {
            case 1:
                // there is a change in the timetable
                break;
            case 2:
                // there is a new chat message
                break;
            case 3:
                // there is a new news message
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
                console.info("Invalid webhook type");
                break;
        }
        console.log("Json has payload");
    }
    console.log(json);
}

async function callFirebaseFunction(functionName: string, payload: any) {
    const res = await axios.post(`https://europe-west3-rdmchr-violet.cloudfunctions.net/${functionName}`, JSON.stringify({ data: { payload } }), {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
}
