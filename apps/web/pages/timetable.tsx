import { app } from '../lib/firebase'
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../lib/context';
import { Week, Day } from '../lib/types';

const db = getFirestore(app);

export default function Timetable() {
    const { uid, loading: ctxLoading } = useContext(UserContext);
    const [week, setWeek] = useState<Week>();
    const [day, setDay] = useState<Day>();
    async function fetchTimetable() {
        const docSnap = await getDoc(doc(db, "timetables", uid));
        // find the latest monday
        var monday = new Date();
        monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
        const timestamp = `${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`;
        const timetable = JSON.parse(await docSnap.data()[timestamp]) as Week;
        setWeek(timetable);
        setDay(timetable[String(new Date().getDay())]);
    }

    function iterateDay(day: Day) {
        if (day) {
            return Object.entries(day).map(([key, value]) => {
                console.log(value)
                if (value) {
                    return <div key={key}>
                        <h3>{key}</h3>
                        <h1>{value.subject}</h1>
                    </div>
                } else {
                    return <div key={key}>
                        <h3>{key}</h3>
                        <h1>No lesson</h1>
                    </div>
                }
            });
        }
    }

    useEffect(() => {
        if(!ctxLoading) {
            fetchTimetable();
        }
    }, [ctxLoading]);

    return (
        <main>
            <div className="border border-black h-[750px]">
                {iterateDay(day)}
            </div>
        </main>
    );
}