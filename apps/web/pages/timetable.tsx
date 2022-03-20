import { app } from '../lib/firebase'
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useContext, useEffect, useState } from 'react';
import { Week, Day } from '../lib/types';
import { getCurrentDay, getCurrentPeriod } from '../lib/util';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { fetchTimetable } from '../lib/data';

const db = getFirestore(app);
const auth = getAuth(app);

export default function Timetable() {
    const [day, setDay] = useState<Day | null>(null)
    const [loading, setLoading] = useState(true);
    const [user, authLoading, authError] = useAuthState(auth);
    const [timetable, setTimetable] = useState<Week | null>(null);
    const [current, setCurrent] = useState<number | null>(null);
    const currentDay = getCurrentDay();

    useEffect(() => {
        if (!authLoading && user.uid) {
            fetchData();
        }
    }, [authLoading, user]);

    async function fetchData() {
        var monday = new Date();
        monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
        const timestamp = `${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`;
        const week = await fetchTimetable(timestamp);
        const currentPeriod = getCurrentPeriod(new Date("2020-09-01 10:00:00"));
        setTimetable(week);
        setDay(week[2]);
        setCurrent(currentPeriod);
        setLoading(false);
    }

    function iterateDay(day: Day) {
        if (day) {
            return Object.entries(day).map(([key, value]) => {
                if (value) {
                    return <div key={key} className={`col-start-2 col-span-1 row-start-${key+1} row-span-1`}>
                        <h1 className='text-ls font-medium'>{value.subject} <span className='text-gray-500'>({value.teacher})</span></h1>
                        <h1>{value.room}</h1>
                        <h1></h1>
                    </div>
                } else {
                    return <div key={key} className={`col-start-2 col-span-1 row-start-${key+1} row-span-1`}>
                        <h1 className='text-gray-500'> </h1>
                    </div>
                }
            });
        }
    }

    useEffect(() => {
        if (!loading && user.uid) {
            fetchData();
        }
    }, [loading, user]);

    const timestampCss = "col-span-1 col-start-1 row-span-1 justify-self-center text-lg font-medium";
    const dayString = () => {
        const date = new Date();
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <main>
            <h1 className='text-center font-bold text-xl my-5 text-violet-900'>Timetable - {dayString()}</h1>
            <div className="grid grid-cols-[max-content,max-content] grid-rows-timetable gap-x-2 gap-y-2 mx-auto w-max px-4">
                <h1 className='col-start-1 col-span-1 row-start-1 row-span-1 px-2 font-semibold'>Period</h1>
                <h1 className='col-start-2 col-span-1 row-start-1 row-span-1 font-semibold'>Lesson</h1>
                {iterateDay(day)}
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