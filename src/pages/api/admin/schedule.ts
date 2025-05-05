import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user?.role !== 3) {
        return res.status(403).json({ message: 'Доступ запрещен: только суперадмин может редактировать расписание' });
    }

    try {
        if (req.method === 'POST') {
            const { classId, day, lessonNumber, title, teacherName, location, startTime, endTime } = req.body;
            console.log('POST /api/admin/schedule body:', req.body);
            if (!classId || !day || !lessonNumber || !title || !teacherName || !startTime || !endTime || !location) {
                return res.status(400).json({ message: 'Все поля обязательны' });
            }
            let teacher = await prisma.user.findFirst({ where: { name: teacherName } });
            if (!teacher) {
                teacher = await prisma.user.create({ data: { name: teacherName, email: `${Date.now()}@auto.local`, password: 'default', role: 1 } });
            }
            const now = new Date();
            const dayMap = { 'Понедельник': 1, 'Вторник': 2, 'Среда': 3, 'Четверг': 4, 'Пятница': 5, 'Суббота': 6 };
            const currentDay = now.getDay() || 7;
            const diff = dayMap[day as keyof typeof dayMap] - currentDay;
            const targetDate = new Date(now);
            targetDate.setDate(now.getDate() + diff);
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);
            const start = new Date(targetDate);
            start.setHours(startHour, startMinute, 0, 0);
            const end = new Date(targetDate);
            end.setHours(endHour, endMinute, 0, 0);
            const item = await prisma.scheduleItem.create({
                data: {
                    title,
                    startTime: start,
                    endTime: end,
                    location,
                    teacherId: teacher.id,
                    classId,
                }
            });
            console.log('Created scheduleItem:', item);
            return res.status(200).json(item);
        }
        if (req.method === 'PUT') {
            const { id, title, teacherName, location, startTime, endTime } = req.body;
            console.log('PUT /api/admin/schedule body:', req.body);
            if (!id || !title || !teacherName || !startTime || !endTime || !location) {
                return res.status(400).json({ message: 'Все поля обязательны' });
            }
            let teacher = await prisma.user.findFirst({ where: { name: teacherName } });
            if (!teacher) {
                teacher = await prisma.user.create({ data: { name: teacherName, email: `${Date.now()}@auto.local`, password: 'default', role: 1 } });
            }
            const item = await prisma.scheduleItem.update({
                where: { id },
                data: {
                    title,
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                    location,
                    teacherId: teacher.id,
                }
            });
            console.log('Updated scheduleItem:', item);
            return res.status(200).json(item);
        }
        if (req.method === 'DELETE') {
            const { id } = req.body;
            console.log('DELETE /api/admin/schedule body:', req.body);
            if (!id) return res.status(400).json({ message: 'id обязателен' });
            await prisma.scheduleItem.delete({ where: { id } });
            return res.status(200).json({ message: 'Удалено' });
        }
        res.status(405).json({ message: 'Метод не поддерживается' });
    } catch (e) {
        console.error('API /api/admin/schedule error:', e);
        res.status(500).json({ message: 'Internal Server Error', error: String(e) });
    }
} 