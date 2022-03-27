import express from 'express';
import { db, auth } from '../'
import getUidFromSchoolName from '../utils/getUidFromSchoolName';
const router = express.Router();

router.post('/tictactoe/create', async (req, res) => {
    /* const token = req.headers.token as string;
    const user = await verifyUser(token); */
    const user = req.user;
    if (!user) {
        res.status(401).send('Not authorized');
        return;
    }
    const enemy = req.body.enemy;
    const enemyId = await getUidFromSchoolName(enemy);
    if (!enemyId) {
        res.status(400).send('Invalid enemy');
        return;
    }
    if (enemyId === user.uid) {
        res.status(400).send('Cannot play against yourself');
        return;
    }
    // check if this user already invited someone
    const tictactoeRef = db.collection('tictactoe');
    const query = await tictactoeRef.where('inviter', '==', user.uid).get();
    if (!query.empty) {
        // make sure the game is not an old or unexpired game
        let removedDocs = 0;
        query.docs.forEach(async (doc) => {
            const data = doc.data();
            if (data.turn === null) {
                await tictactoeRef.doc(doc.id).delete();
                removedDocs++;
            } else if (data.inviteSendAt * (60 * 60 * 1000) > Date.now()) {
                await tictactoeRef.doc(doc.id).delete();
                removedDocs++;
            }
        });
        if (removedDocs !== query.docs.length) {
            res.status(400).send('You already have an active game');
            return;
        }
    }
    // check if there is already a game between the two users, if so accept the invite
    const query2 = await tictactoeRef.where('inviter', '==', enemyId).where('invitee', '==', user.uid).get();
    if (!query2.empty) {
        let docId = null;
        let inviteExpired = false;
        query2.docs.forEach(doc => {
            docId = doc.id;
            inviteExpired = doc.data().inviteSendAt * (60 * 60 * 1000) > Date.now();
        });
        if (docId && !inviteExpired) {
            await tictactoeRef.doc(docId).update({
                accepted: true
            });
            res.status(200).send('Game found');
            return;
        } else if (docId && inviteExpired) {
            await tictactoeRef.doc(docId).delete();
        }
    }
    // create a new game
    const game = await db.collection('tictactoe').add({
        users: [user.uid, enemyId],
        state: JSON.stringify([['', '', ''], ['', '', ''], ['', '', '']]),
        turn: enemyId,
        inviter: user.uid,
        invitee: enemyId,
        accepted: false,
        inviteSendAt: new Date().getTime()
    });
    res.sendStatus(200);
});

router.post('/tictactoe/accept', async (req, res) => {
    const user = req.user;
    const gameId = req.body.gameId;
    if (!user) {
        res.status(401).send('Not authorized');
        return;
    }
    if (!gameId) {
        res.status(400).send('Invalid gameId');
        return;
    }
    const tictactoeRef = db.collection('tictactoe');
    const gameDoc = await tictactoeRef.doc(gameId).get();
    if (!gameDoc.exists) {
        res.status(400).send('Invalid gameId');
        return;
    }
    const gameData = gameDoc.data();
    if (!gameData) {
        res.status(400).send('Invalid gameId');
        return;
    }
    if (gameData.invitee !== user.uid) {
        res.status(400).send('Not authorized');
        return;
    }
    if (gameData.turn === null) {
        // game already ended/was already won
        await tictactoeRef.doc(gameId).delete();
        res.status(400).send('Game expired');
        return;
    }
    if (gameData.accepted) {
        res.status(400).send('Game already accepted');
        return;
    }
    if (gameData.inviteSendAt * (60 * 60 * 1000) < Date.now()) {
        // invite expired
        await tictactoeRef.doc(gameId).delete();
        res.status(400).send('Game expired');
        return;
    }
    await tictactoeRef.doc(gameId).update({
        accepted: true
    });
    res.sendStatus(200);
});

router.post('/tictactoe/deny', async (req, res) => {
    const user = req.user;
    const gameId = req.body.gameId;
    if (!user) {
        res.status(401).send('Not authorized');
        return;
    }
    if (!gameId) {
        res.status(400).send('Invalid gameId');
        return;
    }
    const tictactoeRef = db.collection('tictactoe');
    const gameDoc = await tictactoeRef.doc(gameId).get();
    if (!gameDoc.exists) {
        res.status(400).send('Invalid gameId');
        return;
    }
    const gameData = gameDoc.data();
    if (!gameData) {
        res.status(400).send('Invalid gameId');
        return;
    }
    if (gameData.invitee !== user.uid) {
        res.status(400).send('Not authorized');
        return;
    }
    if (gameData.turn === null) {
        // game already ended/was already won
        await tictactoeRef.doc(gameId).delete();
        res.status(400).send('Game expired');
        return;
    }
    if (gameData.accepted) {
        res.status(400).send('Game already accepted');
        return;
    }
    await tictactoeRef.doc(gameId).delete();
    res.sendStatus(200);
});

router.post('/tictactoe/play', async (req, res) => {
    const user = req.user;
    const gameId = req.body.gameId;
    const row = req.body.row;
    const col = req.body.col;
    if (!user) {
        res.status(401).send('Not authorized');
        return;
    }
    if (!gameId) {
        res.status(400).send('Invalid gameId');
        return;
    }
    if (!row) {
        res.status(400).send('Invalid row');
        return;
    }
    if (!col) {
        res.status(400).send('Invalid col');
        return;
    }
    const tictactoeRef = db.collection('tictactoe');
    const gameDoc = await tictactoeRef.doc(gameId).get();
    if (!gameDoc.exists) {
        res.status(400).send('Invalid gameId');
        return;
    }
    const gameData = gameDoc.data();
    if (!gameData) {
        res.status(400).send('Invalid gameId');
        return;
    }
    if (gameData.turn !== user.uid) {
        res.status(400).send('Not your turn');
        return;
    }
    const state = JSON.parse(gameData.state);
    if (state[row][col] !== '') {
        res.status(400).send('Invalid move');
        return;
    }
    state[row][col] = user.uid;
    const winner = checkGame(state);
    await tictactoeRef.doc(gameId).update({
        state: JSON.stringify(state),
        turn: winner ? null : gameData.turn === gameData.inviter ? gameData.invitee : gameData.inviter
    });
    if (!winner) {
        res.sendStatus(200);
        return;
    }
    return {
        winner: winner,
    };
});

function checkGame(state: [string[], string[], string[]]): string | null {
    let gameOver = false;
    let winner = '';
    for (let i = 0; i < 3; i++) {
        if (state[i][0] !== '' && state[i][0] === state[i][1] && state[i][1] === state[i][2]) {
            gameOver = true;
            winner = state[i][0];
        }
        if (state[0][i] !== '' && state[0][i] === state[1][i] && state[1][i] === state[2][i]) {
            gameOver = true;
            winner = state[0][i];
        }
    }
    if (state[0][0] !== '' && state[0][0] === state[1][1] && state[1][1] === state[2][2]) {
        gameOver = true;
        winner = state[0][0];
    }
    if (state[0][2] !== '' && state[0][2] === state[1][1] && state[1][1] === state[2][0]) {
        gameOver = true;
        winner = state[0][2];
    }
    return gameOver ? winner : null;
}

router.post('tictactoe/check', async (req, res) => {
    const user = req.user;
    const gameId = req.body.gameId;
    if (!user) {
        res.status(401).send('Not authorized');
        return;
    }
    if (!gameId) {
        res.status(400).send('Invalid gameId');
        return;
    }
    const tictactoeRef = db.collection('tictactoe');
    const gameDoc = await tictactoeRef.doc(gameId).get();
    if (!gameDoc.exists) {
        res.status(400).send('Invalid gameId');
        return;
    }
    const gameData = gameDoc.data();
    if (!gameData) {
        res.status(400).send('Invalid gameId');
        return;
    }
    // check if the game is over
    const state = JSON.parse(gameData.state);
    let gameOver = false;
    let winner = '';
    for (let i = 0; i < 3; i++) {
        if (state[i][0] !== '' && state[i][0] === state[i][1] && state[i][1] === state[i][2]) {
            gameOver = true;
            winner = state[i][0];
        }
        if (state[0][i] !== '' && state[0][i] === state[1][i] && state[1][i] === state[2][i]) {
            gameOver = true;
            winner = state[0][i];
        }
    }
    if (state[0][0] !== '' && state[0][0] === state[1][1] && state[1][1] === state[2][2]) {
        gameOver = true;
        winner = state[0][0];
    }
    if (state[0][2] !== '' && state[0][2] === state[1][1] && state[1][1] === state[2][0]) {
        gameOver = true;
        winner = state[0][2];
    }
    if (gameOver) {
        await tictactoeRef.doc(gameId).delete();
    }
    res.sendStatus(200);
});

export default router;