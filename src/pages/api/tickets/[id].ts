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

    const { id } = req.query;

    try {
        if (req.method === 'PUT') {
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ error: 'Status is required' });
            }

            const user = await prisma.user.findUnique({
                where: { email: session.user?.email || '' }
            });

            if (!user || user.role < 2) { // Только админы могут менять статус
                return res.status(403).json({ error: 'Forbidden' });
            }

            const ticket = await prisma.ticket.update({
                where: { id: id as string },
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
        console.error('Error in ticket status update:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 