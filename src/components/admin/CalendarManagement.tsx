import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

interface CalendarEvent {
    id: string;
    title: string;
    description: string | null;
    date: string;
}

export default function CalendarManagement() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 3) {
            router.push('/');
        }
    }, [status, session, router]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/calendar');
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
        setIsLoading(false);
    };

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            const response = await fetch('/api/calendar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.get('title'),
                    description: formData.get('description'),
                    date: formData.get('date'),
                }),
            });

            if (response.ok) {
                fetchEvents();
                form.reset();
            }
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Мероприятия</h3>
                </div>
                <div className="border-t border-gray-200">
                    {isLoading ? (
                        <div className="px-4 py-5 sm:px-6">Загрузка...</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {events.map((event) => (
                                <li key={event.id} className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-indigo-600 truncate">
                                                {event.title}
                                            </p>
                                            <p className="mt-2 text-sm text-gray-500">
                                                {new Date(event.date).toLocaleDateString()}
                                            </p>
                                            {event.description && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {event.description}
                                                </p>
                                            )}
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
                        Добавить мероприятие
                    </h3>
                    <form onSubmit={handleAddEvent} className="mt-5 space-y-4">
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

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Описание
                            </label>
                            <textarea
                                name="description"
                                id="description"
                                rows={3}
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                Дата
                            </label>
                            <input
                                type="datetime-local"
                                name="date"
                                id="date"
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