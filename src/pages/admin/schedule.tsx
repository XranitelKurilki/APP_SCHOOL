import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

const DAYS_OF_WEEK = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

interface Class {
    id: string;
    name: string;
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

const initialEditState = { id: '', title: '', teacherName: '', location: '', startTime: '', endTime: '' };
const initialAddState = { title: '', teacherName: '', location: '', startTime: '', endTime: '' };

export default function AdminSchedule() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(DAYS_OF_WEEK[0]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [editLesson, setEditLesson] = useState<typeof initialEditState | null>(null);
    const [addLesson, setAddLesson] = useState<typeof initialAddState | null>(null);
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
    const [isEditingTeacher, setIsEditingTeacher] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
    const [classTeacher, setClassTeacher] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') return;
        if (!session?.user || session.user.role !== 3) {
            router.push('/login');
        }
    }, [session, status, router]);

    useEffect(() => {
        const fetchClasses = async () => {
            const response = await fetch('/api/classes');
            const data = await response.json();
            setClasses(data.sort((a: Class, b: Class) => parseInt(a.name) - parseInt(b.name)));
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        const fetchTeachers = async () => {
            const response = await fetch('/api/teachers');
            const data = await response.json();
            setTeachers(data);
        };
        fetchTeachers();
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

    const fetchSchedule = async () => {
        if (selectedClass && selectedDay) {
            const response = await fetch(`/api/schedule?classId=${selectedClass}&day=${selectedDay}`);
            const data = await response.json();
            setSchedule(data);
        }
    };

    useEffect(() => {
        fetchSchedule();
        // eslint-disable-next-line
    }, [selectedClass, selectedDay]);

    const handleEdit = (lesson: ScheduleItem) => {
        setEditLesson({
            id: String(lesson.id),
            title: lesson.title,
            teacherName: lesson.teacher.name,
            location: lesson.location || '',
            startTime: lesson.startTime.slice(11, 16),
            endTime: lesson.endTime.slice(11, 16),
        });
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editLesson) return;
        setEditLesson({ ...editLesson, [e.target.name]: e.target.value });
    };

    const handleEditSave = async () => {
        if (!editLesson) return;
        setLoading(true);
        try {
            const today = new Date();
            const dayMap = { 'Понедельник': 1, 'Вторник': 2, 'Среда': 3, 'Четверг': 4, 'Пятница': 5, 'Суббота': 6 };
            const currentDay = today.getDay() || 7;
            const diff = dayMap[selectedDay as keyof typeof dayMap] - currentDay;
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + diff);

            const [startHour, startMinute] = editLesson.startTime.split(':').map(Number);
            const [endHour, endMinute] = editLesson.endTime.split(':').map(Number);

            const start = new Date(targetDate);
            start.setHours(startHour, startMinute, 0, 0);
            const end = new Date(targetDate);
            end.setHours(endHour, endMinute, 0, 0);

            const response = await fetch('/api/admin/schedule', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editLesson,
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),
                }),
            });
            if (response.ok) {
                setEditLesson(null);
                fetchSchedule();
            }
        } catch (error) {
            console.error('Error updating lesson:', error);
        }
        setLoading(false);
    };

    const handleAdd = () => {
        setAddLesson({ ...initialAddState });
    };

    const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!addLesson) return;
        setAddLesson({ ...addLesson, [e.target.name]: e.target.value });
    };

    const handleAddSave = async () => {
        if (!addLesson || !selectedClass || !selectedDay) return;
        setLoading(true);
        await fetch('/api/admin/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...addLesson,
                classId: selectedClass,
                day: selectedDay,
                lessonNumber: schedule.length + 1,
                startTime: addLesson.startTime,
                endTime: addLesson.endTime,
            }),
        });
        setAddLesson(null);
        setLoading(false);
        fetchSchedule();
    };

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

    const handleDelete = async (id: string) => {
        if (!confirm('Вы уверены, что хотите удалить этот урок?')) return;
        setLoading(true);
        try {
            const response = await fetch('/api/admin/schedule', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (response.ok) {
                fetchSchedule();
            }
        } catch (error) {
            console.error('Error deleting lesson:', error);
        }
        setLoading(false);
    };

    if (!selectedClass) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8 max-w-[900px]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Выберите класс</h2>
                    </div>
                    <div className="grid grid-cols-8 justify-center gap-x-4 gap-y-3">
                        {classes.map((cls) => (
                            <button
                                key={cls.id}
                                onClick={() => setSelectedClass(cls.id)}
                                className="bg-blue-500 text-white rounded-lg shadow w-16 h-10 flex items-center justify-center hover:bg-blue-600 transition-colors text-base font-bold"
                            >
                                {cls.name}
                            </button>
                        ))}
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-[900px] flex flex-col items-center">
                <button
                    onClick={() => setSelectedClass(null)}
                    className="mb-6 text-blue-500 hover:text-blue-700 self-start"
                >
                    ← Назад к списку классов
                </button>
                <div className="text-center mb-2 text-xl font-semibold">{classes.find(c => c.id === selectedClass)?.name} класс</div>
                <div className="text-center mb-8 text-base">
                    Классный руководитель: {classTeacher ? classTeacher : '—'}
                    <button
                        onClick={() => setIsEditingTeacher(true)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                        Изменить
                    </button>
                </div>
                <div className="flex gap-2 mb-8">
                    {DAYS_OF_WEEK.map((day) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap ${selectedDay === day
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                {session?.user?.role === 3 && (
                    <div className="flex justify-end mb-4">
                        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={handleAdd}>
                            + Добавить урок
                        </button>
                    </div>
                )}
                <div className="space-y-2">
                    {schedule.map((lesson, idx) => (
                        <div key={lesson.id || idx} className="flex items-center bg-gray-200 rounded mb-2 px-4 py-2">
                            <div className="flex-1">
                                <div className="font-bold text-sm mb-1">{idx + 1} урок</div>
                                <div className="text-base font-semibold leading-tight">{lesson.title}</div>
                                <div className="text-sm flex gap-2 items-center">
                                    <span>Преподаватель: {lesson.teacher.name}</span>
                                    <span className="text-gray-500">|</span>
                                    <span className="text-gray-700">{new Date(lesson.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(lesson.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                            <div className="text-right min-w-[120px] text-base font-semibold">
                                Кабинет {lesson.location || '—'}
                            </div>

                            {session?.user?.role === 3 && (
                                <div className="flex gap-2">
                                    <button className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500" onClick={() => handleEdit(lesson)}>
                                        Редактировать
                                    </button>
                                    <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onClick={() => handleDelete(lesson.id)}>
                                        Удалить
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {/* Модальное окно для редактирования */}
                {editLesson && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                            <h2 className="text-xl font-bold mb-4">Редактировать урок</h2>
                            <div className="space-y-3">
                                <input name="title" value={editLesson.title} onChange={handleEditChange} className="w-full border p-2 rounded" placeholder="Название урока" />
                                <input name="teacherName" value={editLesson.teacherName} onChange={handleEditChange} className="w-full border p-2 rounded" placeholder="Преподаватель" />
                                <input name="location" value={editLesson.location} onChange={handleEditChange} className="w-full border p-2 rounded" placeholder="Кабинет" />
                                <div className="flex gap-2">
                                    <input name="startTime" type="time" value={editLesson.startTime} onChange={handleEditChange} className="w-1/2 border p-2 rounded" placeholder="Начало (08:00)" />
                                    <input name="endTime" type="time" value={editLesson.endTime} onChange={handleEditChange} className="w-1/2 border p-2 rounded" placeholder="Конец (08:40)" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setEditLesson(null)} disabled={loading}>Отмена</button>
                                <button className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600" onClick={handleEditSave} disabled={loading}>Сохранить</button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Модальное окно для добавления */}
                {addLesson && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                            <h2 className="text-xl font-bold mb-4">Добавить урок</h2>
                            <div className="space-y-3">
                                <input name="title" value={addLesson.title} onChange={handleAddChange} className="w-full border p-2 rounded" placeholder="Название урока" />
                                <input name="teacherName" value={addLesson.teacherName} onChange={handleAddChange} className="w-full border p-2 rounded" placeholder="Преподаватель" />
                                <input name="location" value={addLesson.location} onChange={handleAddChange} className="w-full border p-2 rounded" placeholder="Кабинет" />
                                <div className="flex gap-2">
                                    <input name="startTime" type="time" value={addLesson.startTime} onChange={handleAddChange} className="w-1/2 border p-2 rounded" placeholder="Начало (08:00)" />
                                    <input name="endTime" type="time" value={addLesson.endTime} onChange={handleAddChange} className="w-1/2 border p-2 rounded" placeholder="Конец (08:40)" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setAddLesson(null)} disabled={loading}>Отмена</button>
                                <button className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600" onClick={handleAddSave} disabled={loading}>Добавить</button>
                            </div>
                        </div>
                    </div>
                )}
                {isEditingTeacher && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                            <h2 className="text-xl font-bold mb-4">Выберите классного руководителя</h2>
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
        </Layout>
    );
} 