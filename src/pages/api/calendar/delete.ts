import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Метод не разрешен' });
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
        return res.status(401).json({ error: 'Не авторизован' });
    }

    if (session.user.role !== 3) {
        return res.status(403).json({ error: 'Нет доступа' });
    }

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Необходимо указать id' });
    }

    try {
        await prisma.calendarEvent.delete({
            where: { id }
        });

        return res.status(200).json({ message: 'Событие удалено' });
    } catch (error) {
        console.error('Error deleting event:', error);
        return res.status(500).json({ error: 'Ошибка при удалении события' });
    }
} 