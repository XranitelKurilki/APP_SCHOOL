import { useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

type CalendarEvent = {
    id: string;
    title: string;
    description?: string;
    date: string;
    creator: { name: string };
};

type EventsByDate = Record<string, CalendarEvent[]>;

const initialEventState = { id: '', title: '', description: '', date: '' };

const CalendarList = () => {
    const { data: session } = useSession();
    const { data: eventsByDate = {}, isLoading, mutate } = useSWR('/api/calendar', fetcher, { refreshInterval: 2000 });
    const [modalOpen, setModalOpen] = useState(false);
    const [editEvent, setEditEvent] = useState<typeof initialEventState | null>(null);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState(initialEventState);

    const handleOpenAdd = () => {
        setEditEvent(initialEventState);
        setIsEdit(false);
        setModalOpen(true);
    };

    const handleOpenEdit = (event: CalendarEvent) => {
        setEditEvent({
            id: event.id,
            title: event.title,
            description: event.description || '',
            date: event.date
        });
        setIsEdit(true);
        setModalOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editEvent) return;
        setEditEvent({ ...editEvent, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editEvent) return;
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/calendar/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: editEvent.title,
                    description: editEvent.description,
                    date: editEvent.date
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при создании события');
            }

            await mutate();
            setEditEvent(null);
            setModalOpen(false);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Ошибка при создании события');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editEvent) return;

        try {
            const response = await fetch('/api/calendar/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editEvent),
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении события');
            }

            await mutate();
            setEditEvent(null);
            setModalOpen(false);
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Вы уверены, что хотите удалить это событие?')) return;

        try {
            const response = await fetch('/api/calendar/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении события');
            }

            await mutate();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    if (isLoading) return <div className="text-center py-8">Загрузка...</div>;
    if (Object.keys(eventsByDate).length === 0) return <div className="text-center py-8">Нет мероприятий</div>;

    const isSuperAdmin = session?.user?.role === 3;

    return (
        <div className="max-w-xl mx-auto py-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Календарь мероприятий</h2>
            {isSuperAdmin && (
                <div className="flex justify-end mb-4">
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleOpenAdd}
                        disabled={loading}
                    >
                        {loading ? 'Загрузка...' : '+ Добавить мероприятие'}
                    </button>
                </div>
            )}
            {!isLoading && Object.keys(eventsByDate).length === 0 && <div className="text-center py-8">Нет мероприятий</div>}
            {!isLoading && Object.keys(eventsByDate).length > 0 && (
                <div className="space-y-8">
                    {Object.entries(eventsByDate).map(([date, events]) => (
                        <div key={date}>
                            <div className="font-bold text-lg mb-2">{new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Europe/Samara' })}</div>
                            <ul className="space-y-2">
                                {Array.isArray(events) && events.map((ev: CalendarEvent) => (
                                    <li key={ev.id} className="bg-blue-50 rounded p-4 shadow flex flex-col gap-1 relative">
                                        <div className="font-semibold">{ev.title}</div>
                                        {ev.description && <div className="text-gray-600 text-sm">{ev.description}</div>}
                                        {isSuperAdmin && (
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <button
                                                    className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    onClick={() => handleOpenEdit(ev)}
                                                    disabled={loading}
                                                >
                                                    Редактировать
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    onClick={() => handleDelete(ev.id)}
                                                    disabled={loading}
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
            {/* Модальное окно для создания/редактирования */}
            {modalOpen && editEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Редактировать' : 'Добавить'} мероприятие</h2>
                        <form onSubmit={isEdit ? handleEdit : handleSubmit} className="space-y-3">
                            <input name="title" value={editEvent.title} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Название" required />
                            <textarea name="description" value={editEvent.description} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Описание" />
                            <input name="date" type="date" value={editEvent.date} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Дата" required />
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => setModalOpen(false)}
                                    disabled={loading}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Добавить')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarList; 