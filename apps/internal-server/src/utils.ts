import {db} from './firebase';
import {CollectionReference} from "firebase-admin/firestore";
import { UserData } from './types';

export async function isAdmin(uid: string): Promise<boolean> {
    if (!uid) return false;
    const userDataCollection = db.collection("userData") as CollectionReference<UserData>;
    const userData = await userDataCollection.doc(uid).get();
    return userData.data()?.isAdmin || false;
}