import { useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

interface Ticket {
    id: string;
    title: string;
    description: string;
    status: TicketStatus;
    createdAt: string;
    creator: {
        name: string;
        email: string;
    };
}

const TicketList = () => {
    const { data: session } = useSession();
    const { data: tickets = [], isLoading, mutate } = useSWR('/api/tickets', fetcher, { refreshInterval: 2000 });
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'open'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при создании заявки');
            }

            await mutate();
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                status: 'open'
            });
            setModalOpen(false);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Ошибка при создании заявки');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (ticketId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/tickets/${ticketId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении статуса');
            }

            await mutate();
        } catch (error) {
            console.error('Error updating ticket status:', error);
        }
    };

    const getStatusColor = (status: TicketStatus) => {
        switch (status) {
            case 'OPEN':
                return 'bg-green-500';
            case 'IN_PROGRESS':
                return 'bg-yellow-500';
            case 'CLOSED':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    if (isLoading) return <div className="text-center py-8">Загрузка...</div>;
    if (!session?.user || session.user.role === 0) return null;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Тикеты</h2>

            {session.user.role >= 1 && (
                <div className="flex justify-end mb-4">
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        onClick={() => setModalOpen(true)}
                    >
                        + Создать тикет
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {tickets.map((ticket: Ticket) => (
                    <div key={ticket.id} className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold">{ticket.title}</h3>
                                <p className="text-gray-600 mt-2">{ticket.description}</p>
                                <div className="text-sm text-gray-500 mt-2">
                                    Создано: {new Date(ticket.createdAt).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Создал: {ticket.creator.name}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-white text-sm ${getStatusColor(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                                {session?.user?.role !== undefined && session.user.role >= 2 && (
                                    <select
                                        value={ticket.status}
                                        onChange={(e) => handleStatusChange(ticket.id, e.target.value as TicketStatus)}
                                        className="border rounded px-2 py-1"
                                    >
                                        <option value="OPEN">Открыт</option>
                                        <option value="IN_PROGRESS">В работе</option>
                                        <option value="CLOSED">Закрыт</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Создать тикет</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Название</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Описание</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                    onClick={() => setModalOpen(false)}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                                >
                                    Создать
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketList; 