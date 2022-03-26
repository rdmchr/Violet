import { db } from "./initApp";
import * as functions from "firebase-functions";

export const gameManager =
    functions.region("europe-west3").https.onCall(async (data, context) => {
        if (!data.func) {
            return {
                error: "No function specified"
            };
        }
        if (!context.auth) {
            throw new functions.https.HttpsError("failed-precondition",
                "The function must be called while authenticated.");
        }

        switch (data.func) {
            case "TICTACTOE_CREATE":
                const inviteeId = await getUidFromSchoolName(data.invitee);
                if (!inviteeId) return { error: "User not found" };
                await tictactoeCreate(context.auth.uid, inviteeId);
                return {
                    success: true
                };
            default:
                return {
                    error: "Unknown function"
                };
        }

    });

/**
 * Get a user's Firebase uid from their school name
 * @param name the school name of the user
 * @returns the Firebase uid of the user or null if user was not found
 */
async function getUidFromSchoolName(name: string): Promise<string | null> {
    const userDataRef = db.collection('userData');
    const query = await userDataRef.where('xUser', '==', name).get();
    if (query.empty) return null;
    let id = null;
    query.docs.forEach(doc => {
        id = doc.id;
    });
    return id;
}

/**
 * Create a new tic tac toe game
 * @param inviter the Firebase uid of the inviter
 * @param invitee the Firebase uid of the invited user
 */
async function tictactoeCreate(inviter: string, invitee: string) {
    const tictactoeRef = db.collection('tictactoe');
    await tictactoeRef.add({
        inviter: inviter,
        invitee: invitee,
        users: [inviter, invitee],
        turn: invitee,
        state: JSON.stringify([['', '', ''], ['', '', ''], ['', '', '']])
    });
}