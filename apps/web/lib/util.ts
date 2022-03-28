import { Day, Lesson } from "./types";

/**
 * calculates the period for a given date
 * @param date a date object
 * @returns the current period of the given date
 */
/* export function getPeriod(date: Date): Period {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const stamp = hour * 60 + minute;
    if (stamp < (8 * 60)) {
        return Period.BEFORE;
    } if (stamp < (9 * 60 + 7)) {
        return Period.ONE;
    } if (stamp < (10 * 60 + 19)) {
        return Period.TWO;
    } if (stamp < (10 * 60 + 34)) {
        return Period.BREAK;
    } if (stamp < (11 * 60 + 47)) {
        return Period.THREE;
    } if (stamp < (12 * 60 + 59)) {
        return Period.FOUR;
    } if (stamp < (13 * 60 + 49)) {
        return Period.LUNCH_BREAK;
    } if (stamp < (15 * 60 + 1)) {
        return Period.SIX;
    } if (stamp < (16 * 60 + 40)) {
        return Period.SEVEN;
    } else {
        return Period.AFTER;
    }
}

export enum Period {
    BEFORE = -1, // before school started
    ONE = 1,
    TWO = 2,
    BREAK = -2,
    THREE = 3,
    FOUR = 4,
    LUNCH_BREAK = -3,
    SIX = 6,
    SEVEN = 7,
    AFTER = 99, // after school ended
} */


export function getCurrentPeriod(date: Date) {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const stamp = hour * 60 + minute;
    if (stamp < (8 * 60)) {
        return -1;
    } if (stamp < (9 * 60 + 7)) {
        return 1;
    } if (stamp < (10 * 60 + 19)) {
        return 2;
    } if (stamp < (10 * 60 + 34)) {
        return 3;
    } if (stamp < (11 * 60 + 47)) {
        return 3;
    } if (stamp < (12 * 60 + 59)) {
        return 4;
    } if (stamp < (13 * 60 + 49)) {
        return 5;
    } if (stamp < (15 * 60 + 1)) {
        return 6;
    } if (stamp < (16 * 60 + 40)) {
        return 7;
    } else {
        return 99;
    }
}

/**
 * returns the index of the current day in the timetable objet
 */
export function getCurrentDay() {
    return String(new Date().getDay() - 2);
}

/**
 * 
 * @param day the day to check
 * @returns a tuple containing the next period and whether the student has a break coming up
 */
/* export function getNextPeriod(day: Day): [Lesson, boolean] | null {
    const period: Period = getPeriod(new Date("2020-03-03 12:00:00"));
    const last = findLastLesson(day)
    if (day && period) {
        if (period === Period.BEFORE && 0 < last) {
            return [day[1], false];
        } if (period === Period.ONE && 1 < last) {
            return [day[2], false];
        } if (period === Period.TWO && 2 < last) {
            return [day[3], true];
        } if (period === Period.BREAK && 3 < last) {
            return [day[3], false];
        } if (period === Period.THREE && 3 < last) {
            return [day[4], false];
        } if (period === Period.FOUR && 4 < last) {
            return [day[5], true];
        } if (period === Period.LUNCH_BREAK && 5 < last) {
            return [day[6], false];
        } if (period === Period.SIX && 6 < last) {
            return [day[7], false]
        } if (period === Period.SEVEN && 7 < last) {
            return [day[8], false];
        }
        // student is in the last period or has finished school for the day
        return null;
    }
} */

export function nextPeriod(day: Day): [Lesson, boolean] | null {
    const last = findLastLesson(day);
    if (day) {
        for (let i = getCurrentPeriod(new Date()); i < last; i++) {
            if (day[i]) {
                let upcomingBreak = false;
                if (i === 3) upcomingBreak = true;
                if (i ===  6 && !day[5]) upcomingBreak = true;
                return [day[i], upcomingBreak];
            }
        }
    }
    return null;
}

/**
* returns the period of the last lesson of a given day
*/
function findLastLesson(day: Day): number { //FIXME: what happens when there is no lesson on a given day
    if (!day) return 0;
    for (let i = 8; i > 0; i--) {
        if (day[i]) {
            return i;
        }
    }
}
