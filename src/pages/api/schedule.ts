import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

const DAYS_MAP: Record<string, number> = {
    'Понедельник': 1,
    'Вторник': 2,
    'Среда': 3,
    'Четверг': 4,
    'Пятница': 5,
    'Суббота': 6
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { classId, day } = req.query;

    if (!classId || !day || typeof day !== 'string' || !DAYS_MAP[day]) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    try {
        const dayNumber = DAYS_MAP[day];
        const today = new Date();
        const currentDay = today.getDay() || 7;
        const diff = dayNumber - currentDay;

        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + diff);

        const schedule = await prisma.scheduleItem.findMany({
            where: {
                classId: classId as string,
                startTime: {
                    gte: new Date(targetDate.setHours(0, 0, 0, 0)),
                    lt: new Date(targetDate.setHours(23, 59, 59, 999))
                }
            },
            include: {
                teacher: true
            },
            orderBy: {
                startTime: 'asc'
            }
        });

        res.status(200).json(schedule);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
} 