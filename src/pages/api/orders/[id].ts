import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
        return res.status(401).json({ error: 'Не авторизован' });
    }

    if (session.user.role !== 3) {
        return res.status(403).json({ error: 'Нет доступа' });
    }

    const { id } = req.query;

    if (req.method === 'DELETE') {
        try {
            await prisma.order.delete({
                where: {
                    id: String(id)
                }
            });
            return res.status(200).json({ message: 'Заказ удален' });
        } catch (error) {
            console.error('Error deleting order:', error);
            return res.status(500).json({ error: 'Ошибка при удалении заказа' });
        }
    }

    return res.status(405).json({ error: 'Метод не разрешен' });
} 