import { useEffect, useState } from 'react';

const getClassState = (time: number, timeTable: 'def' | 'mon' | 'sat') => {
    const classTimes = {
        mon: [800, 835, 925, 1025, 1125, 1225, 1315, 1400, 1440, 1540, 1630, 1720, 1805, 9999],
        def: [800, 850, 950, 1050, 1150, 1240, 1330, 1430, 1530, 1620, 1710, 1755, 9999],
        sat: [800, 850, 940, 1030, 1120, 1210, 1300, 1350, 1440, 1530, 1620, 1710, 1800, 9999],
    }[timeTable];
    const breakTimes = {
        mon: [830, 915, 1005, 1105, 1205, 1305, 1355, 1420, 1520, 1620, 1710, 1800, 1845, 9999],
        def: [840, 930, 1030, 1130, 1230, 1320, 1410, 1510, 1610, 1700, 1750, 1835, 9999],
        sat: [840, 930, 1020, 1110, 1200, 1250, 1340, 1430, 1520, 1610, 1700, 1750, 1840, 9999],
    }[timeTable];

    let closestClassTime = { index: 0, time: 0 };
    for (let i = 0; i < classTimes.length; i++) {
        if (time - classTimes[i] < 0) {
            closestClassTime = { index: --i, time: classTimes[i] };
            break;
        }
    }

    let closestBreakTime = { index: 0, time: 0 };
    for (let i = 0; i < breakTimes.length; i++) {
        if (time - breakTimes[i] < 0) {
            closestBreakTime = { index: --i, time: breakTimes[i] };
            break;
        }
    }

    if (closestClassTime.time < closestBreakTime.time) {
        return {
            num: closestBreakTime.index + 1,
            isBreak: true,
            time: classTimes[closestClassTime.index + 1],
        };
    } else {
        return {
            num: closestClassTime.index + 1,
            isBreak: false,
            time: breakTimes[closestBreakTime.index + 1],
        };
    }
};

const getMinuteWord = (min: number) => {
    if (min > 10 && min < 20) return 'минут';
    if (min % 10 === 1) return 'минута';
    if ((min - 1) % 10 < 4) return 'минуты';
    return 'минут';
};

export const LessonTimer = () => {
    const [state, setState] = useState({
        visible: false,
        isBreak: false,
        timeLeft: 0,
        classNum: 0,
        part: '',
        partNum: 1,
        finished: false,
    });

    useEffect(() => {
        const update = () => {
            // Получаем время в таймзоне Europe/Samara (Ижевск)
            const date = new Date();
            const samaraTime = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Samara' }));
            const now = samaraTime.getHours() * 100 + samaraTime.getMinutes();
            const day = samaraTime.getDay();
            const timeTable = day === 1 ? 'mon' : day === 6 ? 'sat' : 'def';
            const endTime = { mon: 1850, def: 1845, sat: 1840 }[timeTable];

            if (now < 800 || now >= endTime) {
                setState((s) => ({ ...s, visible: false, finished: true }));
                return;
            }

            const { num, isBreak, time } = getClassState(now, timeTable);
            let timeLeft = time - now;
            if (timeLeft > 40) timeLeft -= 40;
            const index = num - (timeTable === 'mon' ? 1 : 0);

            setState({
                visible: true,
                isBreak,
                timeLeft,
                classNum: ((index - 1) % 7) + 1,
                part: isBreak ? 'Перемена' : 'Урок',
                partNum: index < 7 ? 1 : 2,
                finished: false,
            });
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, []);

    if (state.finished) {
        return (
            <div className="bg-blue-50 rounded px-2 sm:px-3 py-1 select-none w-full sm:w-[260px] max-w-full h-10 sm:h-12 flex items-center ml-4 sm:ml-0 justify-center">
                <span className="text-base sm:text-lg font-semibold text-gray-700">Уроки закончились</span>
            </div>
        );
    }

    if (!state.visible) return null;

    return (
        <div className="bg-blue-50 rounded px-2 sm:px-3 py-1 select-none w-full sm:w-[260px] max-w-full h-10 sm:h-12 flex items-center ml-4 sm:ml-0">
            {/* Мобильная версия: две колонки */}
            <div className="flex w-full sm:hidden items-center justify-between px-2">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-700 whitespace-nowrap">
                        до конца {state.isBreak ? 'перемены' : 'урока'}
                    </span>
                    <span className="text-sm font-normal">
                        {state.timeLeft} {getMinuteWord(state.timeLeft)}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-normal whitespace-nowrap">
                        {state.classNum} {state.isBreak ? 'перемена' : 'урок'}
                    </span>
                    <span className="text-xs font-normal whitespace-nowrap">
                        {state.partNum} смена
                    </span>
                </div>
            </div>
            {/* Desktop версия: две колонки */}
            <div className="hidden sm:flex w-full items-center justify-between">
                <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs text-gray-700 whitespace-nowrap">до конца {state.isBreak ? 'перемены' : 'урока'}</span>
                    <span className="text-xl font-bold leading-none">
                        {state.timeLeft} <span className="text-base font-normal">{getMinuteWord(state.timeLeft)}</span>
                    </span>
                </div>
                <div className="flex flex-col items-end text-right text-sm font-normal ml-2">
                    <span>{state.classNum} {state.isBreak ? 'перемена' : 'урок'}</span>
                    <span>{state.partNum} смена</span>
                </div>
            </div>
        </div>
    );
}; 