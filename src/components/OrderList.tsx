import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';

interface Order {
    id: string;
    classId: string;
    class: {
        name: string;
    };
    order: string;
    createdAt: string;
    creator: {
        name: string;
    };
}

interface Class {
    id: string;
    name: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function OrderList() {
    const { data: session } = useSession();
    const [classes, setClasses] = useState<Class[]>([]);
    const [newOrder, setNewOrder] = useState({
        classId: '',
        order: ''
    });
    const { data: orders = [], isLoading, mutate } = useSWR('/api/orders', fetcher, { refreshInterval: 2000 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await fetch('/api/classes');
            const data = await response.json();
            setClasses(data.sort((a: Class, b: Class) => parseInt(a.name) - parseInt(b.name)));
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const handleDelete = async (orderId: string) => {
        if (!confirm('Вы уверены, что хотите удалить этот заказ?')) return;

        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении заказа');
            }

            await mutate();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Ошибка при удалении заказа');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newOrder),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при создании заказа');
            }

            await mutate();
            setNewOrder({ classId: '', order: '' });
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Ошибка при создании заказа');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
                        Класс
                    </label>
                    <select
                        id="classId"
                        value={newOrder.classId}
                        onChange={(e) => setNewOrder({ ...newOrder, classId: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                    >
                        <option value="">Выберите класс</option>
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                        Заказ
                    </label>
                    <textarea
                        id="order"
                        value={newOrder.order}
                        onChange={(e) => setNewOrder({ ...newOrder, order: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        rows={3}
                        required
                    />
                </div>

                {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {loading ? 'Создание...' : 'Создать заказ'}
                </button>
            </form>

            <div className="space-y-4">
                {Array.isArray(orders) && orders.length > 0 ? (
                    orders.map((order: Order) => (
                        <div key={order.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <div className="flex justify-between">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        {order.class.name}
                                    </h3>
                                    <div className="flex items-center space-x-4">
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                        {session?.user?.role === 3 && (
                                            <button
                                                onClick={() => handleDelete(order.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Удалить
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                    Создал: {order.creator.name}
                                </p>
                            </div>
                            <div className="border-t border-gray-200">
                                <div className="px-4 py-5 sm:px-6">
                                    <p className="text-sm text-gray-900">{order.order}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500">Нет заказов</div>
                )}
            </div>
        </div>
    );
} 