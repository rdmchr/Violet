import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { app } from "./firebase";
import { Week } from "./types";
import Timetable from '../pages/timetable';

const db = getFirestore(app);
const auth = getAuth(app);
export async function fetchTimetable(timestamp: string): Promise<Week> {
    const { uid } = auth.currentUser;
    const docSnap = await getDoc(doc(db, 'timetables', uid));
    const data = await docSnap.data() as Week[];
    var timetable = null
    try {
    timetable = JSON.parse(data[timestamp] as string);
    } catch (error) {}
    return timetable;
}