import { privateEncrypt } from 'crypto';
import { readFileSync } from 'fs';
import axios from 'axios';

/**
 * encrypts a string with a private key
 */
export function encrypt(data: string) {
    const privateKey = readFileSync('/keys/functions.key', 'utf-8');
    const buffer = Buffer.from(data, 'base64');
    const encrypted = privateEncrypt(privateKey, buffer);
    return encrypted.toString('base64');
}

/**
 * checks if a given string is a valid firebase uid
 * @param uid a string you want to check
 * @returns true if the string is a valid uid
 */
export function validUid(uid: string) {
    return /^[a-zA-Z0-9]{0,}$/.test(uid);
}

/**
 * check if a date is in this week or not
 * @param date any date object
 * @returns true if the date is in this week
 */
export function isDateInThisWeek(date: Date) {
    const todayObj = new Date();
    const todayDate = todayObj.getDate();
    const todayDay = todayObj.getDay();

    // get first date of week
    const firstDayOfWeek = new Date(todayObj.setDate(todayDate - todayDay));

    // get last date of week
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

    // if date is equal or within the first and last dates of the week
    return date >= firstDayOfWeek && date <= lastDayOfWeek;
}

/**
 * call a google cloud function
 * @param functionName the name of the cloud function
 * @param payload the payload you want to pass to the function
 */
export async function callFirebaseFunction(functionName: string, payload: any) {
    payload.hello = encrypt('world');
    await axios.post(
        `https://europe-west1-rdmchr-violet.cloudfunctions.net/${functionName}`,
        JSON.stringify({ data: payload }),
        {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }
    );
}