export function timeDifference(current, previous) {

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return '~' + Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return '~' + Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return '~' + Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

export function dateToLocalString(date: Date, extended = false) {
    return date.toLocaleDateString('de-DE', {
        year: '2-digit',
        month: extended ? '2-digit' : 'numeric',
        day: extended ? '2-digit' : 'numeric',
        hour: extended ? '2-digit' : 'numeric',
        minute: extended ? '2-digit' : 'numeric'
    })
}

export function dateFromLocalString(dateStr: string) {
    const [datePart, timePart] = dateStr.split(', ');
    const [day, month, year] = datePart.split('.');
    const [hour, minute] = timePart.split(':');
    const isoStr = `20${year}-${month}-${day}T${hour}:${minute}:00.000Z`;
    return new Date(isoStr);
}