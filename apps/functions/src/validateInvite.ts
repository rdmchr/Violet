import {db} from "./initApp";
import * as functions from "firebase-functions";
import {CollectionReference, Timestamp} from "firebase-admin/firestore";

interface Invite {
    usedBy: string | null;
    usedAt: Timestamp | null;
    createdBy: string;
    createdAt: Timestamp;
    expiresAt: Timestamp;
}

export const validateInvite =
    functions.region("europe-west1").https.onCall(async (data, context) => {
      const uid = context.auth?.uid;
      if (!uid) {
        return {error: "Unauthorized"};
      }
      const inviteId = data.inviteId;
      if (!inviteId) {
        return {error: "No inviteId specified"};
      }
      const invitesRef =
            db.collection("invites") as CollectionReference<Invite>;
      const invite = await invitesRef.doc(inviteId).get();
      if (!invite.exists) {
        return {error: "No invite found"};
      }
      const inviteData = invite.data();
      if (!inviteData) {
        return {error: "No invite data found"};
      }
      if (inviteData.usedBy) {
        return {error: "Invite already used"};
      }
      if (inviteData.expiresAt.toDate().getTime() < Date.now()) {
        return {error: "Invite expired"};
      }
      await invitesRef.doc(inviteId).update({
        usedBy: uid,
        usedAt: new Date(),
      });
      const userDataRef = db.collection("userData") as CollectionReference;
      await userDataRef.doc(uid).update({
        enlightened: true,
        invite: inviteId,
      });
      const userRef = db.collection("users") as CollectionReference;
      await userRef.doc(uid).update({
        enlightened: true,
      });
      return {success: true};
    });
