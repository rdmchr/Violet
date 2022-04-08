import * as puppeteer from "puppeteer";
import {HTTPResponse} from "puppeteer";

/**
 * queries the school website and returns the timetable as a typescript object
 * @param {string} username the username of the user
 * @param {string} password the password of the user
 * @param {string} uid the firebase uid of the user
 * @param {string} URL the URL to connect to
 * @param {string} sel the selector to wait for
 * @param {string} endpoint the endpoint to get the response from
 * @param {string} action the action in the post method's body to listen for
 * parsed into a typescript object
 */
/* eslint-disable */
export async function fetchData(username: string, password: string, uid: string, URL: string, sel: string, endpoint: string, action: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let data = null;
  /* eslint-disable */
  page.on("response", async (response: HTTPResponse) => {
    if (response.url().endsWith(endpoint) && (response.request().postData() as string).includes(action)) {
      const json = await response.json();
      console.log("response code: ", response.status());
      if (response.status() === 200) {
        data = json;
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

  await page.waitForSelector(sel);

  await browser.close();
  return data;
}

export type DataSource = {
  endpoint: string;
  action: string;
}

export async function fetchMultipleData(username: string, password: string, URL: string, sel: string[], dataSources: DataSource[]) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let data: any = {};
  /* eslint-disable */
  page.on("response", async (response: HTTPResponse) => {
    dataSources.forEach(async (dataSource: DataSource) => {
      if (response.url().endsWith(dataSource.endpoint) && (response.request().postData() as string).includes(dataSource.action)) {
        const json = await response.json();
        console.log("response code: ", response.status());
        if (response.status() === 200) {
          data[dataSource.action] = json;
        }
      }
    })
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

  let prom: Promise<any>[] = [];

  sel.forEach((selector) => {
    prom.push(page.waitForSelector(selector));
  })

  await Promise.all(prom);

  await browser.close();
  return data;
}
