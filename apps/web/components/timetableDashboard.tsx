import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

type DayProps = {
    day: EditorDay,
    lessons: EditorLesson[],
}


export type Data = {
    lessons: {
        [name: string]: {
            id: string,
            teacher: string,
            subject: string,
            room: string,
        }
    },
    days: {
        [name: string]: {
            id: string,
            lessons: string[],
        }
    },
    dashboard: {
        [name: string]: {
            id: string,
            lessons: string[]
        }
    }
}

type DashProps = {
    board: EditorDay,
    lessons: EditorLesson[],
}

type LessonProps = {
    lesson: EditorLesson,
    horizontal: boolean,
    index: number,
}

export type EditorDay = {
    id: string,
    lessons: string[]
}

export type EditorLesson = {
    id: string,
    teacher: string,
    subject: string,
    room: string,
}

export function DayList({ day, lessons }: DayProps) {

    return (
        <div className='m-1 border w-[17%] rounded flex'>
            <h3 className='text p-2 text-center underline underline-offset-2 absolute'>
                {day.id}
            </h3>
            <Droppable droppableId={day.id}>
                {(provided) => {
                    return (
                        <div className='text p-1 bg-[rgb(270,0,0,0.5)] grow mt-10' {...provided.droppableProps} ref={provided.innerRef}>
                            {lessons.map((lesson, index) => <LessonElem key={lesson.id} lesson={lesson} horizontal={false} index={index} />)}
                            {provided.placeholder}
                        </div>
                    )
                }}
            </Droppable>
        </div>
    );
}

export function DashboardList({ board, lessons }: DashProps) {

    return (
        <div className='m-1 border rounded flex'>
            <div className='text p-1 bg-[rgb(270,0,0,0.5)] grow flex'>
                {lessons.map((lesson, index) => <LessonElem key={lesson.id} lesson={lesson} horizontal={true} index={index} />)}
            </div>
        </div>
    )
}

function LessonElem({ lesson, horizontal, index }: LessonProps) {
    return (
        <Draggable draggableId={lesson.id} index={index}>
            {(provided) => (
                <div className={`border rounded p-2 text-[8pt] ${horizontal ? 'mr-2' : 'mb-2'} bg-[skyblue]`} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <p>{lesson.subject} {lesson.teacher}</p>
                    <p>{lesson.room}</p>
                </div>
            )}
        </Draggable>
    )
}