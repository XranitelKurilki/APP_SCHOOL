import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { compare, hash } from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) return res.status(401).json({ error: 'Unauthorized' });
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Все поля обязательны' });
    try {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user || !user.password) return res.status(400).json({ error: 'Пользователь не найден' });
        const isMatch = await compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Старый пароль неверен' });
        const hashed = await hash(newPassword, 10);
        await prisma.user.update({ where: { email: session.user.email }, data: { password: hashed } });
        return res.status(200).json({ ok: true });
    } catch (e) {
        return res.status(500).json({ error: 'Ошибка сервера' });
    }
} 