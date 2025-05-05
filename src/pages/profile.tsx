import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Layout from '../components/Layout';

const Profile = () => {
    const { data: session } = useSession();
    const [name, setName] = useState(session?.user?.name || '');
    const [email] = useState(session?.user?.email || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);
        setError(null);
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) throw new Error('Ошибка при сохранении профиля');
            setStatus('Профиль обновлен');
        } catch (err) {
            setError('Ошибка при сохранении профиля');
        }
    };

    const handlePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);
        setError(null);
        if (!oldPassword || !newPassword || !repeatPassword) {
            setError('Заполните все поля для смены пароля');
            return;
        }
        if (newPassword !== repeatPassword) {
            setError('Пароли не совпадают');
            return;
        }
        try {
            const res = await fetch('/api/profile/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPassword, newPassword }),
            });
            if (!res.ok) throw new Error('Ошибка при смене пароля');
            setStatus('Пароль успешно изменён');
            setOldPassword('');
            setNewPassword('');
            setRepeatPassword('');
        } catch (err) {
            setError('Ошибка при смене пароля');
        }
    };

    if (!session) return <div className="p-8">Необходимо войти в систему</div>;

    return (
        <Layout>
            <div className="max-w-xl mx-auto bg-white rounded shadow p-6 mt-8">
                <h1 className="text-2xl font-bold mb-4">Профиль</h1>
                <form onSubmit={handleSave} className="space-y-4 mb-8">
                    <div>
                        <label className="block text-gray-700 mb-1">Имя</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            className="w-full border rounded px-3 py-2"
                            disabled
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Сохранить</button>
                </form>
                <form onSubmit={handlePassword} className="space-y-4">
                    <h2 className="text-lg font-semibold mb-2">Смена пароля</h2>
                    <div>
                        <label className="block text-gray-700 mb-1">Старый пароль</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">Новый пароль</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">Повторите новый пароль</label>
                        <input
                            type="password"
                            value={repeatPassword}
                            onChange={e => setRepeatPassword(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Сменить пароль</button>
                </form>
                {(status || error) && (
                    <div className={`mt-4 ${status ? 'text-green-600' : 'text-red-600'}`}>{status || error}</div>
                )}
            </div>
        </Layout>
    );
};

export default Profile; 