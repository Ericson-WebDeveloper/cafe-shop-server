export const calDiffISODate = (s: Date, e: Date) => {
    // let date1 = new Date(s.toLocaleDateString('en-US', {timeZone: 'Asia/Manila'}));
    // let date2 = new Date(e.toLocaleDateString('en-US', {timeZone: 'Asia/Manila'}));
    // const timeDifference: number = e.getTime() - s.getTime();
    const timeDifference: number = s.getTime() - e.getTime();
    const seconds = timeDifference / 1000;
    const minutes = Math.trunc(timeDifference / (1000 * 60));
    const hours = Math.trunc(timeDifference / (1000 * 60 * 60));
    const days = Math.trunc(timeDifference / (1000 * 60 * 60 * 24));

    return { seconds, minutes, hours, days }
}

export const getDateTimeNow = () => {
    return new Date(new Date().toLocaleString('en-US', {timeZone: 'Asia/Manila'}));
}