import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import OrderList from '../components/OrderList';

export default function Orders() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!session?.user) {
        router.push('/login');
        return null;
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">Заказы в столовую</h1>
                    <OrderList />
                </div>
            </div>
        </Layout>
    );
} 