import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user?.email as string },
    });

    if (!user || user.role !== 3) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.method === 'GET') {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });
            return res.status(200).json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'POST') {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || role === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });

            return res.status(201).json(newUser);
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'PUT') {
        const { id, name, email, password, role } = req.body;

        if (!id || !name || !email || role === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            const existingUser = await prisma.user.findUnique({
                where: { id },
            });

            if (!existingUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            const updateData: any = {
                name,
                email,
                role,
            };

            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }

            const updatedUser = await prisma.user.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });

            return res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
} 