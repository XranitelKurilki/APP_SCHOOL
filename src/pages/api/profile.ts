import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') return res.status(405).end();
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) return res.status(401).json({ error: 'Unauthorized' });
    const { name } = req.body;
    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Некорректное имя' });
    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: { name },
        });
        return res.status(200).json({ ok: true });
    } catch (e) {
        return res.status(500).json({ error: 'Ошибка сервера' });
    }
} 