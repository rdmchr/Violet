import {db} from "./initApp";
import * as functions from "firebase-functions";
import {CollectionReference} from "firebase-admin/firestore";
import {fetchData} from "./handlers";


interface userData {
  xPass: string;
  xUser: string;
  invite: string;
}

const store = db;

export const fetchEverything =
  functions.runWith({memory: "1GB", timeoutSeconds: 30})
      .region("europe-west1").https.onCall(async (_data, context) => {
        const uid = context.auth?.uid;
        if (!uid) {
          return {error: "Unauthenticated"};
        }

        const userCredCollection =
        await store.collection("userData") as CollectionReference<userData>;
        const userData = await (await userCredCollection.doc(uid).get()).data();
        if (!userData?.xPass || !userData.xUser) {
          return {error: "No user data found"};
        }
        // check for invite
        if (!userData.invite) {
          return {error: "You are not invited to use this Violet feature."};
        }
        functions.logger.info(`Running fetchEverything for ${uid}`,
            {structuredData: true});
        await fetchData(uid, userData.xUser, userData.xPass, true, {
          timetable: true, nextTimetable: true, news: true,
        });
        return {success: true};
      });
/* eslint-enable */
