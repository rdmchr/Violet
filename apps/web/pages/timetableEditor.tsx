import { app } from '../lib/firebase'
import { getFirestore } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import Loading from '../components/loading';
import { GetStaticProps } from 'next';
import { loadTranslation } from '../lib/transUtil';
import { useRouter } from 'next/router';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { data } from '../lib/timetableDataConverter';
import { EditorDay, DayList, EditorLesson, DashboardList, Data } from '../components/timetableDashboard';
import CarbonArrowLeft from '../icons/CarbonArrowLeft';

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

export default function TimetableEditor() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, authLoading, authError] = useAuthState(auth);
    const [state, setState] = useState<Data>(data);
    const [dashboardDisplay, setDashboardDisplay] = useState<boolean>(false);

    useEffect(() => {
        if (!authLoading && user) {
            doStuff();
        }
    }, [authLoading, user]);

    if (!authLoading && !user) {
        router.push("/");
        return;
    }

    if (authLoading || loading) {
        return (<Loading />);
    }

    function doStuff() {
        setLoading(false)
    }

    function onDragEnd(result: DropResult) {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        var start : EditorDay = null;

        if (destination.droppableId.includes('dabo')) {
            return;
        }
        if (source.droppableId.includes('dabo')) {
            start = state.dashboard[source.droppableId];
        } else {
            start = state.days[source.droppableId];
        }
        const finish = state.days[destination.droppableId];

        if (start === finish) {

            const day: EditorDay = state.days[source.droppableId];
            const newLessonIds = Array.from(day.lessons);
            newLessonIds.splice(source.index, 1);
            newLessonIds.splice(destination.index, 0, draggableId);

            const newDay: EditorDay = {
                ...day,
                lessons: newLessonIds,
            };

            const newState: Data = {
                ...state,
                days: {
                    ...state.days,
                    [newDay.id]: newDay,
                },
            };

            setState(newState);
            return;
        }

        const startLessonIds = Array.from(start.lessons);
        startLessonIds.splice(source.index, 1);
        const newStart : EditorDay = {
            ...start,
            lessons: startLessonIds,
        };

        const finishLessonIds = Array.from(finish.lessons);
        finishLessonIds.splice(destination.index, 0, draggableId);
        const newFinish : EditorDay = {
            ...finish,
            lessons: finishLessonIds,
        };

        const newState : Data = {
            ...state,
            days: {
                ...state.days,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            }
        };

        setState(newState);
    }

    function Dashboard() {

        return (
            <div className="absolute top-[65%] left-0 w-[100vw] h-[35vh] bg-[pink]">
                <div className='flex'>
                    {Object.entries(state.dashboard).map(([key, value]) => {
                        const board: EditorDay = value;
                        const lessons: EditorLesson[] = board.lessons.map(lessonid => state.lessons[lessonid]);

                        return <DashboardList key={board.id} lessons={lessons} board={board} />
                    })}
                </div>
            </div>
        );
    }

    function LessonCreator() {
        
    }

    return (
        <main className='w-full min-h-[100vh] bg'>
            <CarbonArrowLeft className='icon text-2xl' onClick={() => setDashboardDisplay(!dashboardDisplay)} />
            <div className='text text-[20pt] text-center underline underline-offset-2 m-4 border'>Hello</div>
            <DragDropContext onDragEnd={(result) => onDragEnd(result)}>
                <div className='flex place-content-center h-[70%]'>
                    {Object.entries(state.days).map(([key, value]) => {
                        const day: EditorDay = value;
                        const lessons: EditorLesson[] = day.lessons.map(lessonid => state.lessons[lessonid]);

                        return <DayList key={day.id} lessons={lessons} day={day} />
                    })}
                </div>
                {dashboardDisplay ? <Dashboard /> : <></>}
            </DragDropContext>
        </main>
    );
}

