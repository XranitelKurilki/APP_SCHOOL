import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    if (req.method === 'GET') {
        try {
            const teachers = await prisma.user.findMany({
                where: {
                    role: 1 // Учителя имеют роль 1
                },
                select: {
                    id: true,
                    name: true
                },
                orderBy: {
                    name: 'asc'
                }
            });

            return res.json(teachers);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        }
    }

    return res.status(405).json({ message: 'Метод не разрешен' });
} 