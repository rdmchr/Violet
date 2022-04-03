import {db} from "./initApp";
import * as functions from "firebase-functions";
import {CollectionReference} from "firebase-admin/firestore";

export const createUserData =
  functions.region("europe-west1").https.onCall(async (data, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      return {error: "Unauthorized"};
    }
    const {name} = data;
    if (!name) {
      return {error: "No name specified"};
    }

    const userRef = db.collection("userData") as CollectionReference;
    const user = await userRef.doc(uid).get();
    if (user.exists) {
      return {error: "User already exists"};
    }
    await userRef.doc(uid).set({
      enlightened: false,
      invite: "",
      xUser: null,
      xPass: null,
      name,
    });
    return {success: true};
  });
