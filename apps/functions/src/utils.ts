import {publicDecrypt} from "crypto";

/**
 * decrypts a given string using a previously exchanged public key
 * @param {string} data the data you want to decrypt
 * @return {string} the decrypted data
 */
export function decrypt(data: string): string {
  const key = process.env.WEBHOOK_KEY as string;
  const buffer = Buffer.from(data, "base64");
  const decrypted = publicDecrypt(key, buffer);
  return decrypted.toString("base64");
}


/**
 * checks if a given string is a valid firebase uid
 * @param {string} uid a string you want to check
 * @return {string} true if the string is a valid uid
 */
export function validUid(uid: string) {
  return /^[a-zA-Z0-9]{0,}$/.test(uid);
}
