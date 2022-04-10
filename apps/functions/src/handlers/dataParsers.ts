import {Day, Lesson, News, Users, Week} from "../types";
/**
 * Parses a timetable from json to a Week object
 * @param {any} json the timetable json object
 * @return {Week} the timetable json object
 */
export async function parseTimetable(json: any) {
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
  return week;
}

/**
* Parses news from json to a News object
* @param {any} messages this is the JSON with all announcement data from puppeteer
* @return {News} the news object
*/
export async function parseNews(messages: any): Promise<News> {
  const news: any = {};
  await messages.forEach(async (elem: any) => {
    const messageID = elem.splice(0, 1);
    elem.splice(1, 1);
    elem.splice(3, 3);
    elem[1] = JSON.parse(JSON.stringify(elem[1]).substring(0, 4) + "\"");
    const data = JSON.stringify(elem);
    news[messageID] = data;
  });
  return news;
}

/**
 * Parses a users array from json to a Users object
 * @param {any} json the users json object
 * @return {Users} the users json object
 */
export function parseUsers(json: any): Promise<Users> {
  const users: any = {};
  json.forEach((elem: any) => {
    users[elem[0]] = elem[1];
  });
  return users;
}
