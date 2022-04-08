import {Week} from "../types";
import {db} from "../initApp";
import {FieldValue} from "firebase-admin/firestore";

/**
 * Uploads a timetable to firestore
 * @param {Week} data this is JSON with Timetable for week
 * @param {string} uid this is the userID
 */
export async function uploadTimetable(data: Week, uid: string) {
  // find the latest monday
  const monday = new Date();
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const timestamp = monday.toISOString().split("T")[0];
  if (data) {
    const docSnap = await db.collection("timetable").doc(uid).get();
    if (docSnap.exists) {
      await db.collection("timetables").doc(uid).update({
        [timestamp]: JSON.stringify(data),
      });
    } else {
      await db.collection("timetables").doc(uid).set({
        [timestamp]: JSON.stringify(data),
      });
    }
  }
}

/**
 *
 * @param {JSON} data this is the reworked JSON
 *  ready to be stored in the DB it contains: message, Teacher and timestamp
 * @param {string} messageId this is the messageId
 * which becomes the ID for the doc in DB
 * @param {string} uid this is the userID
 */
export async function uploadNews(data: JSON, messageId: string, uid: string) {
  if (data) {
    const coll = await db.collection("messages").doc("" + messageId).get();
    if (coll.exists) {
      await db.collection("messages").doc("" + messageId).update({
        permittedUsers: FieldValue.arrayUnion(uid),
      });
    } else {
      await db.collection("messages").doc("" + messageId).set({
        permittedUsers: [uid],
        data: data,
      });
    }
  }
}
