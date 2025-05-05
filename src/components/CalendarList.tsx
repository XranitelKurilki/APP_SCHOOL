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
    const { data: eventsByDate = {}, isLoading } = useSWR('/api/calendar', fetcher, { refreshInterval: 10000 });
    const [modalOpen, setModalOpen] = useState(false);
    const [editEvent, setEditEvent] = useState<typeof initialEventState | null>(null);
    const [isEdit, setIsEdit] = useState(false);

    const handleOpenAdd = () => {
        setEditEvent({ ...initialEventState, date: new Date().toISOString().slice(0, 10) });
        setIsEdit(false);
        setModalOpen(true);
    };

    const handleOpenEdit = (event: CalendarEvent) => {
        setEditEvent({
            id: event.id,
            title: event.title,
            description: event.description || '',
            date: event.date.slice(0, 10)
        });
        setIsEdit(true);
        setModalOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editEvent) return;
        setEditEvent({ ...editEvent, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!editEvent) return;
        if (isEdit) {
            await fetch('/api/calendar', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editEvent),
            });
        } else {
            await fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editEvent),
            });
        }
        setModalOpen(false);
        setEditEvent(null);
    };

    const handleDelete = async (id: string) => {
        await fetch('/api/calendar', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
    };

    if (isLoading) return <div className="text-center py-8">Загрузка...</div>;
    if (Object.keys(eventsByDate).length === 0) return <div className="text-center py-8">Нет мероприятий</div>;

    const isSuperAdmin = session?.user?.role === 3;

    return (
        <div className="max-w-xl mx-auto py-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Календарь мероприятий</h2>
            {isSuperAdmin && (
                <div className="flex justify-end mb-4">
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={handleOpenAdd}>
                        + Добавить мероприятие
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
                                                <button className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500" onClick={() => handleOpenEdit(ev)}>
                                                    Редактировать
                                                </button>
                                                <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onClick={() => handleDelete(ev.id)}>
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
                        <div className="space-y-3">
                            <input name="title" value={editEvent.title} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Название" />
                            <textarea name="description" value={editEvent.description} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Описание" />
                            <input name="date" type="date" value={editEvent.date} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Дата" />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setModalOpen(false)}>Отмена</button>
                            <button className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600" onClick={handleSave}>{isEdit ? 'Сохранить' : 'Добавить'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarList; 