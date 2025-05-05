import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const { classId } = req.query;
            const scheduleItems = await prisma.scheduleItem.findMany({
                where: {
                    classId: classId as string
                },
                include: {
                    teacher: true,
                    ['class']: true
                } as any
            });
            return res.json(scheduleItems);
        } catch (error) {
            console.error('Error fetching schedule:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'POST' && session?.user?.role === 1) {
        try {
            const { title, startTime, endTime, location, teacherId, classId } = req.body;
            const newScheduleItem = await prisma.scheduleItem.create({
                data: {
                    title,
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                    location,
                    teacherId,
                    classId
                }
            });
            return res.json(newScheduleItem);
        } catch (error) {
            console.error('Error creating schedule item:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
} 