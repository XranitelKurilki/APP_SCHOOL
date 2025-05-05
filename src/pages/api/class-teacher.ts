import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user?.role !== 3) {
        return res.status(403).json({ message: 'Доступ запрещен: только суперадмин может редактировать классных руководителей' });
    }

    try {
        if (req.method === 'GET') {
            const { classId } = req.query;
            if (!classId) {
                return res.status(400).json({ message: 'ID класса обязателен' });
            }

            const classData = await prisma.class.findUnique({
                where: { id: classId as string },
                include: {
                    classTeacher: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            return res.json(classData?.classTeacher || null);
        }

        if (req.method === 'PUT') {
            const { classId, teacherId } = req.body;
            if (!classId || !teacherId) {
                return res.status(400).json({ message: 'ID класса и ID учителя обязательны' });
            }

            const updatedClass = await prisma.class.update({
                where: { id: classId },
                data: {
                    classTeacherId: teacherId
                },
                include: {
                    classTeacher: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            return res.json(updatedClass.classTeacher);
        }

        return res.status(405).json({ message: 'Метод не разрешен' });
    } catch (error) {
        console.error('Error in class-teacher API:', error);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
} 