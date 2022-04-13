//this file will become the data converter to parse the data
//created by drag n drop in order to upload it to the db.
//it will also load the db data and convert it into data 
//usable by the drag n drop logic

export const data =
{
    lessons: {
        '0': {
            id: '0',
            teacher: 'Sdt',
            subject: 'M',
            room: 'A102',
        },
        '1': {
            id: '1',
            teacher: 'Sta',
            subject: 'E',
            room: 'A101',
        },
        '2': {
            id: '2',
            teacher: 'Brt',
            subject: 'If',
            room: 'F105',
        },
        '3': {
            id: '3',
            teacher: 'Ban',
            subject: 'Sw',
            room: 'A103',
        },
        '4': {
            id: '4',
            teacher: '',
            subject: 'frei',
            room: '',
        },
    },
    days: {
        'mo': {
            id: 'mo',
            lessons: ['0'],
        },
        'tue': {
            id: 'tue',
            lessons: ['2'],
        },
        'wed': {
            id: 'wed',
            lessons: ['3'],
        },
        'thu': {
            id: 'thu',
            lessons: [],
        },
        'fri': {
            id: 'fri',
            lessons: [],
        }
    },
    dashboard: {
        'dabo-1': {
            id: 'dabo-1',
            lessons: ['1', '4'],
        }
    }
}