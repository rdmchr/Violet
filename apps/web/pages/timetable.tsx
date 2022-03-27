import { app } from '../lib/firebase'
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useContext, useEffect, useState } from 'react';
import { Week, Day } from '../lib/types';
import { getCurrentDay, getCurrentPeriod } from '../lib/util';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { fetchTimetable } from '../lib/data';
import { TableIcon, CalendarIcon } from '../icons';
import { Trans } from '@lingui/macro';
import { GetStaticProps } from 'next';
import { loadTranslation } from '../lib/transUtil';
import { useRouter } from 'next/router';

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

export default function Timetable() {
    const [day, setDay] = useState<Day | null>(null); // todays timetable
    const [loading, setLoading] = useState(true);
    const [user, authLoading, authError] = useAuthState(auth);
    const [timetable, setTimetable] = useState<Week | null>(null); // the complete timetable for the week
    const [current, setCurrent] = useState<number | null>(null); // current period
    const [dayView, setDayView] = useState(false); // true when displaying only one day, false when displaying the whole week
    const weekIndex = new Date().getDay() - 1;
    const currentDay = getCurrentDay();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && user) {
            fetchData();
        }
    }, [authLoading, user]);

    if (!authLoading && !user) {
        router.push("/");
        return <></>;
    }

    async function fetchData() {
        var monday = new Date();
        monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
        const timestamp = monday.toISOString().split('T')[0];
        const week = await fetchTimetable(timestamp);
        const currentPeriod = getCurrentPeriod(new Date());
        setTimetable(week);
        if (weekIndex < 5)
            setDay(week[weekIndex]);
        else
            setDay(null);
        setCurrent(currentPeriod);
        setLoading(false);
    }

    function iterateDay(day: Day, dayOffest = 0) {
        if (day) {
            return Object.entries(day).map(([key, value]) => {
                if (value) {
                    return <div key={key} className={`col-start-${2 + dayOffest} col-span-1 row-start-${Number(key) + 1} row-span-1 text-sm sm:text-md`}>
                        <h1 className='text-ls font-medium'>{value.subject} <span className='text-gray-500 hidden sm:inline'>({value.teacher})</span></h1>
                        <h1>{value.room}</h1>
                    </div>
                } else {
                    return <div key={key} className={`col-start-${2 + dayOffest} col-span-1 row-start-${Number(key) + 1} row-span-1`}></div> //no lesson
                }
            });
        }
    }

    function iterateWeek(week: Week) {
        if (week) {
            const test = Object.entries(week).map(([key, value], index) => {
                if (value) {
                    return iterateDay(value, index);
                }
            });
            return test;
        }
        return [];
    }

    const timestampCss = "col-span-1 col-start-1 row-span-1 justify-self-center text-lg font-medium";
    const dayString = () => {
        const date = new Date();
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    }

    if (loading) {
        return <div><Trans id="loading">Loading...</Trans></div>;
    }

    return (
        <main className='w-full'>
            <div className='border border-gray-400 rounded-b-xl mb-2 drop-shadow-lg bg-white md:flex md:items-center md:justify-between md:py-2 md:px-5'>
                <h1 className='text-center font-bold text-xl mt-5 md:mt-0 text-violet-900'><Trans id="timetable">Timetable</Trans> - {dayString()}</h1>
                <button onClick={() => setDayView(!dayView)} className="border border-gray-600 rounded-lg flex items-center px-2 py-1 mx-auto my-2 md:mx-0 md:my-0">{dayView ? <Trans id="showWeek">Show week</Trans> : <Trans id="showDay">Show Day</Trans>}<span className='mx-1' />{dayView ? <CalendarIcon /> : <TableIcon />}</button>
            </div>
            <div className={`grid grid-rows-timetable gap-x-2 gap-y-2 mx-auto w-max-[100vw] px-4 grid-rows-timetable ${dayView ? "grid-cols-[max-content,max-content]" : "grid-cols-timetable-week"}`}>
                {dayView ? <>
                    <h1 className='col-start-2 col-span-1 row-start-1 row-span-1 font-semibold'><Trans id="lesson">Lesson</Trans></h1>
                    {iterateDay(day)}
                </> : <>
                    <h1 className={`col-start-2 col-span-1 row-start-1 row-span-1 font-semibold ${weekIndex === 0 ? "text-violet-400" : ""}`}><Trans id="mon">Mon</Trans></h1>
                    <h1 className={`col-start-3 col-span-1 row-start-1 row-span-1 font-semibold ${weekIndex === 1 ? "text-violet-400" : ""}`}><Trans id="tue">Tue</Trans></h1>
                    <h1 className={`col-start-4 col-span-1 row-start-1 row-span-1 font-semibold ${weekIndex === 2 ? "text-violet-400" : ""}`}><Trans id="wed">Wed</Trans></h1>
                    <h1 className={`col-start-5 col-span-1 row-start-1 row-span-1 font-semibold ${weekIndex === 3 ? "text-violet-400" : ""}`}><Trans id="thu">Thu</Trans></h1>
                    <h1 className={`col-start-6 col-span-1 row-start-1 row-span-1 font-semibold ${weekIndex === 4 ? "text-violet-400" : ""}`}><Trans id="fri">Fri</Trans></h1>
                    {iterateWeek(timetable)}
                </>
                }
                <p className={timestampCss + ` row-start-2 ${current === 1 ? "text-violet-400" : ""}`}>1</p>
                <p className={timestampCss + ` row-start-3 ${current === 2 ? "text-violet-400" : ""}`}>2</p>
                <p className={timestampCss + ` row-start-4 ${current === 3 ? "text-violet-400" : ""}`}>3</p>
                <p className={timestampCss + ` row-start-5 ${current === 4 ? "text-violet-400" : ""}`}>4</p>
                <p className={timestampCss + ` row-start-6 ${current === 5 ? "text-violet-400" : ""}`}>5</p>
                <p className={timestampCss + ` row-start-7 ${current === 6 ? "text-violet-400" : ""}`}>6</p>
                <p className={timestampCss + ` row-start-8 ${current === 7 ? "text-violet-400" : ""}`}>7</p>
                <p className={timestampCss + ` row-start-9 ${current === 8 ? "text-violet-400" : ""}`}>8</p>
            </div>
        </main>
    );
}
