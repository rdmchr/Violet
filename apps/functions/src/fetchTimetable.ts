import {db} from "./initApp";
import * as functions from "firebase-functions";
import {CollectionReference} from "firebase-admin/firestore";
import {fetchData} from "./puppeteerConnector";
import {decrypt} from "./utils";

const URL = (process.env.WEBSITE_URL as string) || "";
const sel = "#aktuelleWoche > div > .row > .small-12 > .stundenplan" +
  "> tr:nth-child(1) > .header:nth-child(1)";

const endpoint = "datanew.php?sto=0";
const action = "getstdpl";

interface userData {
  xPass: string;
  xUser: string;
}

const store = db;

export const fetchTimetable =
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
    functions.logger.info(`Running fetch-timetable for ${uid}`,
        {structuredData: true});
    const timetable =
    /* eslint-disable */
     await fetchData(userData.xUser, userData.xPass, uid, URL, sel, endpoint, action);
    return parseJSON(JSON.stringify(timetable), uid);
  });


/**
 * Parses the data returned by the school website
 * @param {string} jsonString the unparsed json as a string
 * @param {string} uid the firebase uid of the user
 * @return {Week} the parsed json as typescript object
 */
export async function parseJSON(jsonString: string, uid: string) {
  const json = JSON.parse(jsonString);
  const days = json[1];
  const week: Week = {};
  for (let dayNum = 0; dayNum < 5; dayNum++) {
    const rawDay = days[dayNum];
    const day: Day = {};
    for (const lessonNum of Object.keys(rawDay)) {
      const rawLesson = rawDay[lessonNum];
      // if there is no subject in this period skip to the next one
      if (rawLesson === 1) {
        day[Number(lessonNum)] = null;
      } else { // otherwise safe the data for the period
        const lesson: Lesson = {
          teacher: rawLesson["0"],
          subject: rawLesson["1"],
          room: rawLesson["2"],
        };
        day[Number(lessonNum)] = lesson;
      }
    }
    week[dayNum] = day;
  }
  await uploadToFirestore(week, uid);
  return week;
}

/**
 * 
 * @param data this is JSON with Timetable for week
 * @param uid this is the userID
 */
async function uploadToFirestore(data: Week, uid: string) {
  // find the latest monday
  const monday = new Date();
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const timestamp = monday.toISOString().split('T')[0];
  if (data) {
    const docSnap = await store.collection("timetable").doc(uid).get();
    if (docSnap.exists) {
      await store.collection("timetables").doc(uid).update({
        [timestamp]: JSON.stringify(data),
      });
    } else {
      await store.collection("timetables").doc(uid).set({
        [timestamp]: JSON.stringify(data),
      });
    }
  }
}

type Lesson = {
  teacher: string;
  room: string;
  subject: string;
}

type Day = {
  [lesson: number]: Lesson | null;
}

type Week = {
  [day: number]: Day;
}
