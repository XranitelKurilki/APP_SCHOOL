import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
        return res.status(401).json({ error: 'Не авторизован' });
    }

    if (req.method === 'GET') {
        try {
            const orders = await prisma.order.findMany({
                include: {
                    class: true,
                    creator: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return res.json(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    if (req.method === 'POST') {
        const { classId, order } = req.body;

        if (!classId || !order) {
            return res.status(400).json({ error: 'Необходимо указать класс и заказ' });
        }

        try {
            const newOrder = await prisma.order.create({
                data: {
                    classId,
                    order,
                    createdBy: session.user.id
                },
                include: {
                    class: true,
                    creator: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            });
            return res.status(201).json(newOrder);
        } catch (error) {
            console.error('Error creating order:', error);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    return res.status(405).json({ error: 'Метод не разрешен' });
} 