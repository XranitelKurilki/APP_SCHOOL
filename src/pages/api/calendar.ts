import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            console.error('User not found for email:', session.user.email);
            return res.status(404).json({ error: 'User not found' });
        }

        if (req.method === 'GET') {
            const events = await prisma.calendarEvent.findMany({
                orderBy: { date: 'asc' },
                include: { creator: true }
            });
            // Группируем по дате (YYYY-MM-DD)
            const grouped: Record<string, typeof events> = {};
            for (const event of events) {
                const dateKey = event.date.toISOString().slice(0, 10);
                if (!grouped[dateKey]) grouped[dateKey] = [];
                grouped[dateKey].push(event);
            }
            res.status(200).json(grouped);
        }

        if (req.method === 'POST') {
            if (user.role !== 3) {
                return res.status(403).json({ error: 'Forbidden: Only admins can create events' });
            }

            const { title, description, date } = req.body;

            if (!title || !date) {
                return res.status(400).json({ error: 'Title and date are required' });
            }

            const newEvent = await prisma.calendarEvent.create({
                data: {
                    title,
                    description,
                    date: new Date(date),
                    creator: {
                        connect: {
                            id: user.id
                        }
                    }
                },
                include: {
                    creator: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            });
            return res.json(newEvent);
        }

        if (req.method === 'PUT') {
            if (user.role !== 3) {
                return res.status(403).json({ error: 'Forbidden: Only admins can edit events' });
            }
            const { id, title, description, date } = req.body;
            if (!id || !title || !date) {
                return res.status(400).json({ error: 'ID, title and date are required' });
            }
            const updatedEvent = await prisma.calendarEvent.update({
                where: { id },
                data: {
                    title,
                    description,
                    date: new Date(date)
                }
            });
            return res.json(updatedEvent);
        }

        if (req.method === 'DELETE') {
            if (user.role !== 3) {
                return res.status(403).json({ error: 'Forbidden: Only admins can delete events' });
            }
            const { id } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'ID is required' });
            }
            await prisma.calendarEvent.delete({
                where: { id }
            });
            return res.status(204).end();
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error in calendar API:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 