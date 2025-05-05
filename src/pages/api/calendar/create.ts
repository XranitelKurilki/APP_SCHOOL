import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Метод не разрешен' });
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
        return res.status(401).json({ error: 'Не авторизован' });
    }

    if (session.user.role !== 3) {
        return res.status(403).json({ error: 'Нет доступа' });
    }

    const { title, description, date } = req.body;

    if (!title || !date) {
        return res.status(400).json({ error: 'Необходимо указать название и дату' });
    }

    try {
        const event = await prisma.calendarEvent.create({
            data: {
                title,
                description,
                date: new Date(date),
                createdBy: session.user.id
            }
        });

        return res.status(200).json(event);
    } catch (error) {
        console.error('Error creating event:', error);
        return res.status(500).json({ error: 'Ошибка при создании события' });
    }
} 