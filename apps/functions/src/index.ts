import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {CollectionReference} from "firebase-admin/firestore";
import * as puppeteer from "puppeteer";

const URL = (process.env.WEBSITE_URL as string) || "";

interface userData {
  xPass: string;
  xUser: string;
}

admin.initializeApp();
const store = admin.firestore();

export const fetchTimeTable = functions.https.onCall(async (_data, context) => {
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
  const timetable = await run(userData.xUser, userData.xPass, uid);
  return timetable;
});

/**
 * queries the school website and returns the timetable as a typescript object
 * @param {string} username the username of the user
 * @param {string} password the password of the user
 * @param {string} uid the firebase uid of the user
 * @return {Week} the data of the user's timetable
 * parsed into a typescript object
 */
async function run(username: string, password: string, uid: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let data = null;
  /* eslint-disable */
  page.on("response", async (response: { url: () => string; json: () => any; status: () => number; }) => {
    if (response.url().endsWith("datanew.php?sto=0")) {
      const jason = await response.json();
      // console.log(JSON.stringify(jason));
      console.log("response code: ", response.status());
      if (response.status() === 200) {
        data = parseJSON(JSON.stringify(jason), uid);
      }
    }
  });

  const navigationPromise = page.waitForNavigation();

  await page.goto(URL);

  await page.setViewport({ width: 1680, height: 943 });

  await page.waitForSelector("#username");
  await page.type("#username", username);

  await page.waitForSelector("#password");
  await page.type("#password", password);

  await page.waitForSelector("#loginbutton");
  await page.click("#loginbutton");


  await navigationPromise;

  /* eslint-disable */
  const sel =
    "#aktuelleWoche > div > .row > .small-12 > .stundenplan > tr:nth-child(1) > .header:nth-child(1)";

  await page.waitForSelector(sel);

  await browser.close();
  return data;
}

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

async function uploadToFirestore(data: Week, uid: string) {
  // find the latest monday
  var monday = new Date();
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const timestamp = `${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`;
  if (data) {
    const docSnap = await store.collection("timetable").doc(uid).get();
    if (docSnap.exists) {
      await store.collection('timetables').doc(uid).update({
        [timestamp]: JSON.stringify(data),
      })
    } else {
      await store.collection('timetables').doc(uid).set({
        [timestamp]: JSON.stringify(data),
      })
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
