import { useState, useEffect } from 'react';
import { prisma } from '../lib/prisma';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const DAYS_OF_WEEK = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

interface Class {
    id: string;
    name: string;
    classTeacher?: {
        name: string;
    };
}

interface ScheduleItem {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    location?: string;
    teacher: {
        name: string;
    };
}

export default function Schedule() {
    const { data: session } = useSession();
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(DAYS_OF_WEEK[0]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [classTeacher, setClassTeacher] = useState<string | null>(null);
    const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
    const [isEditingTeacher, setIsEditingTeacher] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

    useEffect(() => {
        const fetchClasses = async () => {
            const response = await fetch('/api/classes');
            const data = await response.json();
            // Сортируем классы по номеру
            const sortedClasses = data.sort((a: Class, b: Class) => {
                const numA = parseInt(a.name);
                const numB = parseInt(b.name);
                return numA - numB;
            });
            setClasses(sortedClasses);
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        const fetchClassTeacher = async () => {
            if (selectedClass) {
                const response = await fetch(`/api/class-teacher?classId=${selectedClass}`);
                const data = await response.json();
                setClassTeacher(data?.name || null);
            }
        };
        fetchClassTeacher();
    }, [selectedClass]);

    useEffect(() => {
        const fetchTeachers = async () => {
            const response = await fetch('/api/teachers');
            const data = await response.json();
            setTeachers(data);
        };
        fetchTeachers();
    }, []);

    const handleTeacherChange = async () => {
        if (!selectedClass || !selectedTeacherId) return;

        try {
            const response = await fetch('/api/class-teacher', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classId: selectedClass,
                    teacherId: selectedTeacherId
                })
            });

            if (response.ok) {
                const data = await response.json();
                setClassTeacher(data.name);
                setIsEditingTeacher(false);
            }
        } catch (error) {
            console.error('Error updating class teacher:', error);
        }
    };

    // SWR для расписания
    const { data: schedule = [], isLoading } = useSWR(
        selectedClass && selectedDay ? `/api/schedule?classId=${selectedClass}&day=${selectedDay}` : null,
        fetcher,
        { refreshInterval: 10000 }
    );

    if (!selectedClass) {
        return (
            <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-[900px]">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold">Выберите класс</h2>
                    {session?.user?.role === 3 && (
                        <a href="/admin/schedule" className="bg-gray-800 text-white px-3 sm:px-4 py-2 rounded hover:bg-gray-900 transition-colors text-sm sm:text-base">Админ-панель</a>
                    )}
                </div>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {classes.map((cls) => (
                        <button
                            key={cls.id}
                            onClick={() => setSelectedClass(cls.id)}
                            className="bg-blue-500 text-white rounded-lg shadow w-full min-h-[38px] sm:min-h-[45px] flex items-center justify-center hover:bg-blue-600 transition-colors text-base font-bold py-1 sm:py-2 px-2"
                        >
                            {cls.name}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-[900px] flex flex-col items-center">
            <button
                onClick={() => setSelectedClass(null)}
                className="mb-4 sm:mb-6 text-blue-500 hover:text-blue-700 self-start text-sm sm:text-base"
            >
                ← Назад к списку классов
            </button>
            <div className="text-center mb-1 sm:mb-2 text-xl sm:text-2xl font-bold">{classes.find(c => c.id === selectedClass)?.name} класс</div>
            <div className="text-center mb-4 sm:mb-8 text-base sm:text-lg">
                Классный руководитель: {classTeacher ? classTeacher : '—'}
                {session?.user?.role === 3 && (
                    <button
                        onClick={() => setIsEditingTeacher(true)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                        Изменить
                    </button>
                )}
            </div>
            <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 w-full pb-2">
                {DAYS_OF_WEEK.map((day) => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-3 sm:px-4 py-1 sm:py-2 rounded-lg whitespace-nowrap text-xs sm:text-base ${selectedDay === day
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                    >
                        {day}
                    </button>
                ))}
            </div>
            <div className="w-full">
                {schedule.length > 0 ? (
                    <div className="space-y-2">
                        {schedule.map((lesson: ScheduleItem, idx: number) => (
                            <div key={lesson.id || idx} className="flex flex-col sm:flex-row sm:items-center bg-gray-200 rounded mb-2 px-2 sm:px-4 py-2 gap-2 sm:gap-0">
                                <div className="flex-1">
                                    <div className="font-bold text-base sm:text-lg mb-1">{idx + 1} урок</div>
                                    <div className="text-base sm:text-lg font-semibold leading-tight">{lesson.title}</div>
                                    <div className="text-base sm:text-lg flex gap-2 items-center flex-wrap">
                                        <span>Преподаватель: {lesson.teacher.name}</span>
                                        <span className="text-gray-500">|</span>
                                        <span className="text-base sm:text-lg text-gray-600">
                                            {new Date(lesson.startTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Samara' })} - {new Date(lesson.endTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Samara' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right min-w-[90px] sm:min-w-[120px] text-base sm:text-lg font-semibold">
                                    Кабинет {lesson.location || '—'}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 text-base sm:text-lg">
                        Нет уроков на этот день
                    </div>
                )}
            </div>
            {isEditingTeacher && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md shadow-lg">
                        <h2 className="text-lg sm:text-xl font-bold mb-4">Выберите классного руководителя</h2>
                        <select
                            value={selectedTeacherId}
                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                            className="w-full border p-2 rounded mb-4"
                        >
                            <option value="">Выберите учителя</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsEditingTeacher(false)}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleTeacherChange}
                                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 