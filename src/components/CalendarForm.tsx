import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function CalendarForm() {
    const { data: session } = useSession();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/calendar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Ошибка при создании события');
            }

            setSuccess('Событие успешно добавлено');
            setFormData({
                title: '',
                description: '',
                date: ''
            });
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Произошла ошибка при добавлении события');
            console.error('Error:', error);
        }
    };

    if (session?.user?.role !== 3) {
        return null;
    }

    return (
        <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Добавить событие</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Название
                    </label>
                    <input
                        type="text"
                        id="title"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Описание
                    </label>
                    <textarea
                        id="description"
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Дата и время
                    </label>
                    <input
                        type="datetime-local"
                        id="date"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                )}

                {success && (
                    <div className="text-green-500 text-sm">{success}</div>
                )}

                <div>
                    <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Добавить
                    </button>
                </div>
            </form>
        </div>
    );
} 