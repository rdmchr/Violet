import {db} from "./initApp";
import * as functions from "firebase-functions";
import {CollectionReference, FieldValue} from "firebase-admin/firestore";
import {fetchData} from "./puppeteerConnector";

const URL = (process.env.WEBSITE_URL as string) || "";
const sel = "#Mitteilungen > div > .row > #\\32 0901 > div:nth-child(1)";

const endpoint = "basis.php";
const action = "getMess";

interface userData {
  xPass: string;
  xUser: string;
}

const store = db;

export const fetchAnnouncements =
  functions.region("europe-west3").https.onCall(async (_data, context) => {
    if (URL.length < 1) {
      throw new Error("No URL specified");
    }
    if (!context.auth) {
      throw new functions.https.HttpsError("failed-precondition",
          "The function must be called while authenticated.");
    }

    const uid = context.auth.uid;

    const userCredCollection =
      await store.collection("userData") as CollectionReference<userData>;
    const userData = await (await userCredCollection.doc(uid).get()).data();
    if (!userData?.xPass || !userData.xUser) {
      throw new Error("No user data found");
    }
    functions.logger.info(`Running fetch-announcements for ${uid}`,
        {structuredData: true});
    const announcements =
    /* eslint-disable */
     await fetchData(userData.xUser, userData.xPass, uid, URL, sel, endpoint, action);
    return parseJSON(JSON.stringify(announcements), uid);
  });

/**
 * 
 * @param messages this is the JSON with all announcement data from puppeteer
 * @param uid this is the userID
 */
function parseJSON(messages:any, uid:string) {
  JSON.parse(messages)[0].forEach((elem:any) => {
    const messageID = elem.splice(0, 1);
    elem.splice(1, 1);
    elem.splice(3, 3);
    elem[1] = JSON.parse(JSON.stringify(elem[1]).substring(0, 4)+"\"");
    const data = JSON.stringify(elem).replaceAll("<br />\\n", "\\n");
    uploadToFirestore(JSON.parse(data), uid, messageID as string);
  });
}

/**
 * 
 * @param data this is the reworked JSON ready to be stored in the DB it contains: message, Teacher and timestamp
 * @param uid this is the userID
 * @param messageId this is the messageId which becomes the ID for the doc in DB
 */
async function uploadToFirestore(data: JSON, uid:string, messageId: string) {
  if (data) {
    const coll = await store.collection("messages").doc(""+messageId).get();
    if (coll.exists) {
      await store.collection("messages").doc(""+messageId).update({
        permittedUsers: FieldValue.arrayUnion(uid),
      });
    } else {
      await store.collection("messages").doc(""+messageId).set({
        permittedUsers: [uid],
        data: data,
      });
    }
  }
}
