import {db} from "./initApp";
import * as functions from "firebase-functions";
import {CollectionReference} from "firebase-admin/firestore";

interface Invite {
    usedBy: string;
    usedAt: Date;
    createdBy: string;
    createdAt: Date;
    expiresAt: Date;
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
      if (inviteData.expiresAt.getTime() < Date.now()) {
        return {error: "Invite expired"};
      }
      await invitesRef.doc(inviteId).update({
        usedBy: uid,
        usedAt: new Date(),
      });
      const userRef = db.collection("userData") as CollectionReference;
      await userRef.doc(uid).update({
        enlightened: true,
        invite: inviteId,
      });
      return {success: true};
    });
