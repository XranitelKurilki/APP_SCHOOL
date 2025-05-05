import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

interface Class {
    id: string;
    name: string;
}

interface ScheduleItem {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    location: string;
    teacherId: string;
}

export default function ScheduleManagement() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 3) {
            router.push('/');
        }
    }, [status, session, router]);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchSchedule(selectedClass);
        }
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            const response = await fetch('/api/classes');
            const data = await response.json();
            setClasses(data);
            if (data.length > 0) {
                setSelectedClass(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchSchedule = async (classId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/schedule?classId=${classId}`);
            const data = await response.json();
            setSchedule(data);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        }
        setIsLoading(false);
    };

    const handleAddScheduleItem = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            const response = await fetch('/api/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.get('title'),
                    startTime: formData.get('startTime'),
                    endTime: formData.get('endTime'),
                    location: formData.get('location'),
                    teacherId: session?.user?.id,
                    classId: selectedClass,
                }),
            });

            if (response.ok) {
                fetchSchedule(selectedClass);
                form.reset();
            }
        } catch (error) {
            console.error('Error adding schedule item:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="class" className="block text-sm font-medium text-gray-700">
                    Выберите класс
                </label>
                <select
                    id="class"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    {classes.map((classItem) => (
                        <option key={classItem.id} value={classItem.id}>
                            {classItem.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Расписание</h3>
                </div>
                <div className="border-t border-gray-200">
                    {isLoading ? (
                        <div className="px-4 py-5 sm:px-6">Загрузка...</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {schedule.map((item) => (
                                <li key={item.id} className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-indigo-600 truncate">
                                                {item.title}
                                            </p>
                                            <p className="mt-2 text-sm text-gray-500">
                                                {new Date(item.startTime).toLocaleTimeString()} -{' '}
                                                {new Date(item.endTime).toLocaleTimeString()}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Кабинет: {item.location}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Добавить занятие
                    </h3>
                    <form onSubmit={handleAddScheduleItem} className="mt-5 space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Название
                            </label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                                    Время начала
                                </label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    id="startTime"
                                    required
                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                                    Время окончания
                                </label>
                                <input
                                    type="datetime-local"
                                    name="endTime"
                                    id="endTime"
                                    required
                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                Кабинет
                            </label>
                            <input
                                type="text"
                                name="location"
                                id="location"
                                required
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Добавить
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 