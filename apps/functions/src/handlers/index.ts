import * as puppeteer from "puppeteer";
import {HTTPResponse} from "puppeteer";
import {parseNews, parseTimetable, parseUsers} from "./dataParsers";
import {uploadNews, uploadTimetable} from "./firestoreHandler";


const url = process.env.WEBSITE_URL;

/**
 * Defines which data will be queried from the website
 * @param timetable null for no timetable,
 * 1 for this weeks timetable, 2 for next weeks timetable
 */
type requiredData = {
    timetable?: boolean;
    nextTimetable?: boolean;
    news?: boolean;
    users?: boolean;
}

/**
 *
 * @param {string} uid the userID
 * @param {string} username the website username
 * @param {string} password the website password
 * @param {boolean} writeToFirebase whether the data should be written to firebase
 * @param {requiredData} param4 which data you want to get from the website
 * @return {any} the data from the website as an object,
 * where the key is the same as param4
 */
export async function fetchData(uid: string, username: string, password: string,
    writeToFirebase: boolean, {timetable = false, nextTimetable = false, news = false, users = false}: requiredData) {
  if (!url) {
    console.error("No URL specified");
    return null;
  }
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const navigationPromise = page.waitForNavigation();
  let data = {};

  page.on("response", async (response: HTTPResponse) => {
    if (response.status() !== 200) return;
    if (response.request().method() !== "POST") return;
    const postData = response.request().postData();
    if (!postData?.includes("aktion")) return;
    if (postData.includes("aktion=getTicker")) return;
    if (response.request().url().includes("auth.php")) return;
    const body = await response.text();
    if (!body) return;
    const json = JSON.parse(await response.text());
    // handle messages
    if (news && postData.includes("getMess")) {
      const newsData = await parseNews(json[0]);
      if (writeToFirebase) {
        Object.keys(newsData).forEach(async (messageID: string) => {
          await uploadNews(JSON.parse(newsData[messageID]), messageID, uid);
        });
      }
      data = {...data, news: newsData};
    }
    // handle current timetable
    if (timetable && postData.includes("getstdpl") &&
    response.request().url().endsWith("?sto=0")) {
      const timetableData = await parseTimetable(json);
      if (writeToFirebase) await uploadTimetable(timetableData, uid);
      data = {...data, timetable: timetableData};
    }
    // handle next timetable
    if (nextTimetable && postData.includes("getstdpl") &&
    response.request().url().endsWith("?sto=1")) {
      const timetableData = await parseTimetable(json);
      if (writeToFirebase) await uploadTimetable(timetableData, uid, false);
      data = {...data, nextTimetable: timetableData};
    }
    // handle user names
    if (users && postData.includes("getUserNames")) {
      const userData = parseUsers(json[0]);
      data = {...data, users: userData};
    }
  });

  await page.goto(`${url}login.php`);

  await page.setViewport({width: 1680, height: 943});

  await page.waitForSelector("#username");
  await page.type("#username", username);

  await page.waitForSelector("#password");
  await page.type("#password", password);

  await page.waitForSelector("#loginbutton");
  await page.click("#loginbutton");

  await navigationPromise;
  await page.waitForNavigation({waitUntil: "networkidle0"});
  // await page.waitForSelector("#aktuelleWoche > div > .row >
  // .small-12 > .stundenplan > tr:nth-child(1) > .header:nth-child(1)");

  await browser.close();
  return data;
}
