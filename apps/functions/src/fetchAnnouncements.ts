import {db} from "./initApp";
import * as functions from "firebase-functions";
import {CollectionReference, FieldValue} from "firebase-admin/firestore";
import {fetchData} from "./puppeteerConnector";
import {decrypt} from "./utils";

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
  functions.region("europe-west1").https.onCall(async (data) => {
    if (URL.length < 1) {
      throw new Error("No URL specified");
    }
    if (!data.uid) {
      throw new Error("No UID specified");
    }
    if (!data.hello) {
      // fail silently. the attribute `hello` was missing in the data
      return;
    }
    const hello = decrypt(data.hello);
    if (hello !== "world") {
      // fail silently. the attribute `hello` could not be decrypted
      return;
    }
    const uid = decrypt(data.uid);

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
export async function parseJSON(messages:any, uid:string) {
  await JSON.parse(messages)[0].forEach(async (elem:any) => {
    const messageID = elem.splice(0, 1);
    elem.splice(1, 1);
    elem.splice(3, 3);
    elem[1] = JSON.parse(JSON.stringify(elem[1]).substring(0, 4)+"\"");
    const data = JSON.stringify(elem).replaceAll("<br />\\n", "\\n");
    await uploadToFirestore(JSON.parse(data), uid, messageID as string);
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
