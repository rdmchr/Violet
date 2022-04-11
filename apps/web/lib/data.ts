import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { app } from "./firebase";
import { Week } from "./types";
import Timetable from '../pages/timetable';

const db = getFirestore(app);
const auth = getAuth(app);
export async function fetchTimetable(timestamp: string): Promise<Week | null> {
    const { uid } = auth.currentUser;
    const docSnap = await getDoc(doc(db, 'timetables', uid));
    const data = docSnap.data() as Week[];
    const week = data[timestamp];
    return week;
}