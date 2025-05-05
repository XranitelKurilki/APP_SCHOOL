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
            const classes = await (prisma as any)['class'].findMany({
                include: {
                    scheduleItems: {
                        include: {
                            teacher: true
                        }
                    }
                }
            });
            return res.json(classes);
        } catch (error) {
            console.error('Error fetching classes:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'POST' && session?.user?.role === 1) {
        try {
            const { name } = req.body;
            const newClass = await (prisma as any)['class'].create({
                data: { name }
            });
            return res.json(newClass);
        } catch (error) {
            console.error('Error creating class:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
} 