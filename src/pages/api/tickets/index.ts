import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '../../../lib/prisma';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        if (req.method === 'GET') {
            const user = await prisma.user.findUnique({
                where: { email: session.user?.email || '' }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Ученики не могут видеть тикеты
            if (user.role === 0) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            let tickets;
            if (user.role === 3) { // Суперадмин - видит все тикеты
                tickets = await prisma.ticket.findMany({
                    include: {
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
            } else if (user.role === 2) { // Системный администратор - видит все кроме закрытых
                tickets = await prisma.ticket.findMany({
                    where: {
                        status: {
                            not: 'CLOSED'
                        }
                    },
                    include: {
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
            } else if (user.role === 1) { // Учитель - видит только свои тикеты
                tickets = await prisma.ticket.findMany({
                    where: {
                        createdBy: user.id
                    },
                    include: {
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
            }

            return res.json(tickets);
        }

        if (req.method === 'POST') {
            const { title, description } = req.body;

            if (!title?.trim() || !description?.trim()) {
                return res.status(400).json({ error: 'Название и описание обязательны' });
            }

            const user = await prisma.user.findUnique({
                where: { email: session.user?.email || '' }
            });

            if (!user || user.role === 0) { // Ученики не могут создавать тикеты
                return res.status(403).json({ error: 'Forbidden' });
            }

            const ticket = await prisma.ticket.create({
                data: {
                    title: title.trim(),
                    description: description.trim(),
                    createdBy: user.id
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

            return res.json(ticket);
        }

        if (req.method === 'PUT') {
            const { id, status } = req.body;

            if (!id || !status) {
                return res.status(400).json({ error: 'ID and status are required' });
            }

            const user = await prisma.user.findUnique({
                where: { email: session.user?.email || '' }
            });

            if (!user || user.role < 2) { // Только админы могут менять статус
                return res.status(403).json({ error: 'Forbidden' });
            }

            const ticket = await prisma.ticket.update({
                where: { id },
                data: { status },
                include: {
                    creator: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            });

            return res.json(ticket);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error in tickets API:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 