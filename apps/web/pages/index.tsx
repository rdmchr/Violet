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
import { Trans } from "@lingui/macro";
import { GetStaticProps } from "next";
import { loadTranslation } from "../lib/transUtil";

const db = getFirestore(app);
const auth = getAuth(app);

export const getStaticProps: GetStaticProps = async (ctx) => {
  const translation = await loadTranslation(
      ctx.locale!,
      process.env.NODE_ENV === 'production'
  )
  return {
      props: {
          translation
      }
  }
}

export default function Web() {
  const router = useRouter();
  const [day, setDay] = useState<Day | null>(null)
  const [loading, setLoading] = useState(true);
  const [user, authLoading, authError] = useAuthState(auth);
  const [timetable, setTimetable] = useState<Week | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [upcomingBreak, setUpcomingBreak] = useState<boolean>(false);
  const currentDay = getCurrentDay();
  const weekIndex = new Date().getDay() - 1;

  /* const periodTracker = setInterval(() => {
    const p = getPeriod(new Date())
    setPeriod(p);
  }, 30 * 1000) */

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user) {
      fetchData();
    }
  }, [authLoading, user]);

  async function fetchData() {
    var monday = new Date();
    monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
    const timestamp = monday.toISOString().split('T')[0];
    const week = await fetchTimetable(timestamp);
    setTimetable(week);
    const tempDay = week[weekIndex]
    setDay(tempDay);
    const nextLesson = nextPeriod(tempDay);
    if (nextLesson) {
      setNextLesson(nextLesson[0]);
      setUpcomingBreak(nextLesson[1]);
    }
    setLoading(false);
  }

  if (loading) {
    return <p><Trans id="loading">Loading...</Trans></p>
  }

  return (
    <main>
      <Header settings />
      <div className={"bg-violet-800 text-white rounded-b-xl px-5 py-2 drop-shadow-md"}>
        <div className="flex items-center justify-between">
          <p className="text-sm"><Trans id="nextLesson">Next lesson:</Trans></p>
        </div>
        {nextLesson ? <>
          <h1>{nextLesson.subject}</h1>
          <p>{nextLesson.room}</p>
        </> : <p className="text-lg"><Trans id="finishedSchool">You finished school for today</Trans></p>}
      </div>
      Hello
    </main>
  );
}
