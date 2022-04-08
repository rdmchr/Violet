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

    const userDataRef = db.collection("userData") as CollectionReference;
    const userRef = db.collection("users") as CollectionReference;
    const user = await userDataRef.doc(uid).get();
    if (user.exists) {
      return {error: "User already exists"};
    }
    await userDataRef.doc(uid).set({
      enlightened: false,
      invite: null,
      xUser: null,
      xPass: null,
      name,
    });
    await userRef.doc(uid).set({
      name,
      colorScheme: "light",
    });
    return {success: true};
  });
