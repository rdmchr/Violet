export type Lesson = {
    teacher: string;
    room: string;
    subject: string;
}

export type Day = {
    [lesson: number]: Lesson | null;
}

export type Week = {
    [day: number]: Day;
}
