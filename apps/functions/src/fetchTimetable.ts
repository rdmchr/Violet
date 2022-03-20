import {db} from "./initApp";
import * as functions from "firebase-functions";
import {CollectionReference} from "firebase-admin/firestore";
import {fetchData} from "./puppeteerConnector";

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
  functions.https.onCall(async (_data, context) => {
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
function parseJSON(jsonString: string, uid: string) {
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
    console.log(day);
    week[dayNum] = day;
  }
  uploadToFirestore(week, uid);
  return week;
}

/**
 * 
 * @param data this is data
 * @param uid this is uid
 */
async function uploadToFirestore(data: Week, uid: string) {
  // find the latest monday
  const monday = new Date();
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  /* eslint-disable */
  const timestamp = `${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`;
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
