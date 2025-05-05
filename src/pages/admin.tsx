import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

interface User {
    id: string;
    name: string;
    email: string;
    role: number;
}

export default function Admin() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 0,
    });
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 0,
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 3) {
            router.push('/');
        }
    }, [status, session, router]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/admin/users');
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('Failed to load users');
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated' && session?.user?.role === 3) {
            fetchUsers();
        }
    }, [status, session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create user');
            }

            const data = await response.json();
            setUsers([...users, data]);
            setNewUser({
                name: '',
                email: '',
                password: '',
                role: 0,
            });
        } catch (error) {
            console.error('Error creating user:', error);
            setError(error instanceof Error ? error.message : 'Failed to create user');
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
        });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setError('');
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editingUser.id,
                    ...editForm,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update user');
            }

            const data = await response.json();
            setUsers(users.map(user => user.id === data.id ? data : user));
            setEditingUser(null);
            setEditForm({
                name: '',
                email: '',
                password: '',
                role: 0,
            });
        } catch (error) {
            console.error('Error updating user:', error);
            setError(error instanceof Error ? error.message : 'Failed to update user');
        }
    };

    if (status === 'loading' || loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </Layout>
        );
    }

    if (status === 'unauthenticated' || session?.user?.role !== 3) {
        return null;
    }

    return (
        <Layout>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Admin Panel
                    </h3>
                </div>
                <div className="border-t border-gray-200">
                    <div className="p-4">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={newUser.name}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, name: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={newUser.email}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, email: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={newUser.password}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, password: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="role"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Role
                                </label>
                                <select
                                    id="role"
                                    value={newUser.role}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, role: parseInt(e.target.value) })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value={0}>Student</option>
                                    <option value={1}>Teacher</option>
                                    <option value={2}>System Administrator</option>
                                    <option value={3}>Admin</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Create User
                            </button>
                        </form>
                    </div>
                    <div className="border-t border-gray-200">
                        <h4 className="px-4 py-3 text-sm font-medium text-gray-500">
                            Existing Users
                        </h4>
                        <ul className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <li key={user.id} className="px-4 py-3">
                                    {editingUser?.id === user.id ? (
                                        <form onSubmit={handleUpdate} className="space-y-4">
                                            <div>
                                                <label
                                                    htmlFor="edit-name"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="edit-name"
                                                    value={editForm.name}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, name: e.target.value })
                                                    }
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="edit-email"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    id="edit-email"
                                                    value={editForm.email}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, email: e.target.value })
                                                    }
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="edit-password"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    New Password (leave blank to keep current)
                                                </label>
                                                <input
                                                    type="password"
                                                    id="edit-password"
                                                    value={editForm.password}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, password: e.target.value })
                                                    }
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="edit-role"
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Role
                                                </label>
                                                <select
                                                    id="edit-role"
                                                    value={editForm.role}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, role: parseInt(e.target.value) })
                                                    }
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                >
                                                    <option value={0}>Student</option>
                                                    <option value={1}>Teacher</option>
                                                    <option value={2}>System Administrator</option>
                                                    <option value={3}>Admin</option>
                                                </select>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    type="submit"
                                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    Save Changes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingUser(null)}
                                                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.name}
                                            </div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                            <div className="text-sm text-gray-500">
                                                {user.role === 0
                                                    ? 'Student'
                                                    : user.role === 1
                                                        ? 'Teacher'
                                                        : user.role === 2
                                                            ? 'System Administrator'
                                                            : 'Admin'}
                                            </div>
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 