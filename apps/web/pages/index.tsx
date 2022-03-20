import { useEffect, useState } from "react";
import { Day, Lesson, Week } from "../lib/types";
import { getCurrentDay, nextPeriod } from "../lib/util";
import { getFirestore } from "firebase/firestore";
import { app } from "../lib/firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from "firebase/auth";
import { fetchTimetable } from "../lib/data";
import { SettingsIcon } from "../icons";
import TextTransition, { presets } from "react-text-transition";
import { useRouter } from "next/router";
import Header from "../components/header";

const db = getFirestore(app);
const auth = getAuth(app);

export default function Web() {
  const router = useRouter();
  const [day, setDay] = useState<Day | null>(null)
  const [loading, setLoading] = useState(true);
  const [user, authLoading, authError] = useAuthState(auth);
  const [timetable, setTimetable] = useState<Week | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [upcomingBreak, setUpcomingBreak] = useState<boolean>(false);
  const currentDay = getCurrentDay();

  /* const periodTracker = setInterval(() => {
    const p = getPeriod(new Date())
    setPeriod(p);
  }, 30 * 1000) */

  useEffect(() => {
    if (!authLoading && user) {
      console.log(user);
      fetchData();
    }
  }, [authLoading, user]);

  async function fetchData() {
    var monday = new Date();
    monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
    const timestamp = `${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`;
    const week = await fetchTimetable(timestamp);
    setTimetable(week);
    const tempDay = week[2]
    setDay(tempDay);
    const nextLesson = nextPeriod(tempDay);
    if (nextLesson) {
      setNextLesson(nextLesson[0]);
      setUpcomingBreak(nextLesson[1]);
    }
    setLoading(false);
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <main>
      <Header settings />
      <div className={"bg-violet-800 text-white rounded-b-xl px-5 py-2 drop-shadow-md"}>
        <div className="flex items-center justify-between">
          <p className="text-sm">Next lesson: {upcomingBreak ? <span>☕</span> : <></>}</p>
          
        </div>
        {nextLesson ? <>
          <h1>{nextLesson.subject}</h1>
          <p>{nextLesson.room}</p>
        </> : <p className="text-lg">You finished school for today</p>}
      </div>
      Hello
    </main>
  );
}
