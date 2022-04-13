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
import { EditorDay, DayList, EditorLesson, DashboardList, Data, Lessons } from '../components/timetableDashboard';
import CarbonArrowLeft from '../icons/CarbonArrowLeft';
import { Trans } from '@lingui/react';
import { httpsCallable } from 'firebase/functions';
import { Formik, Form, Field, ErrorMessage } from 'formik';

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

//TODO: add logic to check if more elements than specified
//(8 for the timetable and depending on screensize for dashboard)
//would be in a droppable upon insertion.
//if so, dont drop / create a new lesson.

export default function TimetableEditor() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, authLoading, authError] = useAuthState(auth);
    const [state, setState] = useState<Data>(data);
    const [dashboardDisplay, setDashboardDisplay] = useState<boolean>(false);
    const [creatorDisplay, setCreatorDisplay] = useState<boolean>(false);

    //triggered when side is loading
    useEffect(() => {
        if (!authLoading && user) {
            doStuff();
        }
    }, [authLoading, user]);

    //kick user out if he isn't registered
    if (!authLoading && !user) {
        router.push("/");
        return;
    }

    //show loading animation while side loads
    if (authLoading || loading) {
        return (<Loading />);
    }

    //here go the operation that require loading time
    function doStuff() {
        setLoading(false)
    }

    //this function is called if the dragging of a draggable component ends
    function onDragEnd(result: DropResult) {
        const { destination, source, draggableId } = result;

        /*
        the destination variable has information about the destination where the draggable was dropped, 
            if the draggable wasn't dropped over a droppable the destination is null
            otherwise the droppableID and the Index (in which order the draggable was dropped) is handed over.

        the source contains the same information for the source of the draggable, so where the drag started.
            There will always be a droppableID and an Index in the source, where the draggable was stored before
            the drag started.

        the draggableID is the ID of the object that has been dragged.
        */

        //if there is no destinatio (the draggable isn't over a Droppable) nothing happens and the draggable returns to where it started
        if (!destination) {
            return;
        }

        //the same (nothing) happens if the source and destination are exactly the same
        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        //the following gets the correct starting element out of our data, by using the source.droppableID
        var start: EditorDay = null;

        if (destination.droppableId.includes('dabo')) {
            return;
        }
        if (source.droppableId.includes('dabo')) {
            start = state.dashboard[source.droppableId];
        } else {
            start = state.days[source.droppableId];
        }

        //if the drag ended in the DEATH Droppable the draggable is deleted from the source and the lessons object,
        //it is therefore completly lost
        if (destination.droppableId === 'DEATH') {
            const startLessonIds = Array.from(start.lessons);
            startLessonIds.splice(source.index, 1);
            const newStart: EditorDay = {
                ...start,
                lessons: startLessonIds,
            };
            const newLessonArray: EditorLesson[] = Object.entries(state.lessons).map((key, value) => {
                if (key[1].id !== draggableId) {
                    return key[1];
                }
            });

            const newLessons: Lessons = {};

            newLessonArray.forEach((e) => {
                if (e) {
                    newLessons[e.id] = e;
                }
            });

            if (start.id.includes('dabo')) {
                const newState: Data = {
                    ...state,
                    lessons: newLessons,
                    dashboard: {
                        ...state.dashboard,
                        [newStart.id]: newStart
                    }
                }

                setState(newState);
                return;
            }

            const newState: Data = {
                ...state,
                lessons: newLessons,
                days: {
                    ...state.days,
                    [newStart.id]: newStart
                }
            }

            setState(newState);
            return;
        }

        //if no other case triggerd thus far, the droppable destination must be in the days object
        const finish = state.days[destination.droppableId];

        //if the drag n drop happened in the same droppable only the order has to be changed
        if (start === finish && !start.id.includes('dabo')) {

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

        //otherwise the draggable has to be deleted
        //from the source and inserted in the destination

        //this creates a second day element in which the draggable ID is inserted
        //at the correct position. the state is replaced by this duplicate later on
        const finishLessonIds = Array.from(finish.lessons);
        finishLessonIds.splice(destination.index, 0, draggableId);
        const newFinish: EditorDay = {
            ...finish,
            lessons: finishLessonIds,
        };

        //if the draggable originated in a dashboard the operations for deleting
        //and inserting change. That is because draggables shouldn't be deleted 
        //from the dashboard-Area, bur instead a clone has to be made to ensure
        //the ids stay unique.
        if (start.id.includes('dabo')) {

            //the lessons array of the start element is duplicated and
            //the id of the draggable, that leaves is replaced by the a
            //newly created id, that is guarenteed to be exactly one larger
            //than the largest id.
            const duplicatedStart = Array.from(start.lessons);
            const ids = getLessonIds();
            const newId: string = String(parseInt(ids[ids.length - 1]) + 1);
            duplicatedStart.splice(source.index, 1, newId)

            const oldLesson: EditorLesson = state.lessons[draggableId];
            const newLesson: EditorLesson = {
                ...oldLesson,
                id: newId
            }

            const newDuplicatedStart: EditorDay = {
                ...start,
                lessons: duplicatedStart,
            }

            //the new objects are used to create a new State, which replaced the old one.
            const newState: Data = {
                ...state,
                lessons: {
                    ...state.lessons,
                    [newLesson.id]: newLesson,
                },
                days: {
                    ...state.days,
                    [newFinish.id]: newFinish,
                },
                dashboard: {
                    ...state.dashboard,
                    [newDuplicatedStart.id]: newDuplicatedStart,
                }
            };

            setState(newState);
            return;
        }

        //if no case triggered at this point the operation is fairly simple, we know the
        //draggable originated in a day object and will end up in another one
        //the deletion and insertion is straightforeward
        const startLessonIds = Array.from(start.lessons);
        startLessonIds.splice(source.index, 1);
        const newStart: EditorDay = {
            ...start,
            lessons: startLessonIds,
        };

        const newState: Data = {
            ...state,
            days: {
                ...state.days,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            }
        };

        setState(newState);
    }

    //this is a component that renders out a Dashboard-Area with a 
    //Droppable that is disabled, but contains all newly added lesson-draggables.
    //draggables 
    function Dashboard() {

        return (
            <div className={`absolute top-[65%] left-0 bg-[pink] w-[100vw] h-[35vh]`}>
                <div className='flex min-w-[10%] min-h-[10%]'>
                    {Object.entries(state.dashboard).map(([key, value]) => {
                        const board: EditorDay = value;
                        const lessons: EditorLesson[] = board.lessons.map(lessonid => state.lessons[lessonid]);

                        return <DashboardList key={board.id} lessons={lessons} board={board} />
                    })}
                </div>
                <div className='w-[5%] h-[10%] bg-[black]' onClick={() => setCreatorDisplay(!creatorDisplay)}></div>
                <div className='float float-right mt-11'>
                    <DeletionZone />
                </div>
            </div>
        );
    }

    //this is essentially the component where the draggables come to die.
    //it is just a div with a very friendly skull, but the onDragEnd()  Method
    //ensures that all Draggables that are moved into the droppable zone provided
    //by this component are completly deleted.
    function DeletionZone() {
        return (
            <Droppable droppableId='DEATH'>
                {(provided) => {
                    return (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            <div>💀</div>
                            {provided.placeholder}
                        </div>
                    );
                }}
            </Droppable>
        )
    }

    //this small function is used to return an Array containing all the ids currently 
    //supplied to draggable lesson objects.
    function getLessonIds() {
        var Ids: string[] = [];
        Object.entries(state.lessons).forEach(e => {
            Ids.splice(Ids.length, 0, e[1].id);
        });
        return Ids;
    }

    //this component provides a form, which is used to create new lesson elements, that are then 
    //inserted into the dashboard droppables.
    function LessonCreator() {
        const [error, setError] = useState("");

        return (
            <div className="absolute top-0 left-0 w-[100vw] backdrop-brightness-50 backdrop-grayscale h-[100vh]">
                <div className="bg-[pink] absolute inset-x-1/2 inset-y-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-max px-2 py-2">

                    <Formik
                        initialValues={{ subject: '', teacher: '', room: '' }}
                        validate={values => {
                            const errors: { subject?: any, teacher?: any, room?: any } = {};
                            // validate invite code
                            if (!values.subject) {
                                errors.subject = "Required";
                            }
                            if (!values.teacher) {
                                errors.teacher = "Required";
                            }
                            if (!values.room) {
                                errors.room = "Required";
                            }
                            return errors;
                        }}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            //when the submit button is pressed, a new lesson
                            //element with the values from the form is created.
                            //this element is then inserted in the lessons object
                            //and the id of this newly created lesson is inserted
                            //into the array of lessons stored in the dashboard
                            //component

                            const ids = getLessonIds();
                            const newid: string = String(parseInt(ids[ids.length - 1]) + 1);

                            const newLesson: EditorLesson = {
                                id: newid,
                                teacher: values.teacher,
                                subject: values.subject,
                                room: values.room
                            }

                            const newLessons: string[] = Array.from(state.dashboard['dabo-1'].lessons);
                            newLessons.splice(newLessons.length, 0, newid);

                            const newState: Data = {
                                ...state,
                                lessons: {
                                    ...state.lessons,
                                    [newLesson.id]: newLesson,
                                },
                                dashboard: {
                                    ...state.dashboard,
                                    'dabo-1': {
                                        id: state.dashboard['dabo-1'].id,
                                        lessons: newLessons,
                                    }
                                }
                            }

                            setState(newState);
                            setCreatorDisplay(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <label className="flex flex-col font-semibold text">
                                    subject
                                    <Field type="text" name="subject" className="input" autoComplete='off' />
                                </label>
                                <ErrorMessage name="subject" component="div" className="text-red-400" />
                                <label className="flex flex-col font-semibold text">
                                    teacher
                                    <Field type="text" name="teacher" className="input" autoComplete='off' />
                                </label>
                                <ErrorMessage name="techer" component="div" className="text-red-400" />
                                <label className="flex flex-col font-semibold text">
                                    room
                                    <Field type="text" name="room" className="input" autoComplete='off' />
                                </label>
                                <ErrorMessage name="room" component="div" className="text-red-400" />
                                {error && <div className="text-red-400">{error}</div>}
                                <button type="submit" disabled={isSubmitting} className="text border-violet-900 border-2 px-2 py-1 rounded-lg float-right mt-2 text-lg">
                                    Submit
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        )
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
                {creatorDisplay ? <LessonCreator /> : <></>}
            </DragDropContext>
        </main>
    );
}

