import { prisma } from '../src/lib/prisma.js';

const title = process.argv[2] || 'Мероприятие';
const description = process.argv[3] || 'Описание мероприятия';
const date = process.argv[4] || new Date().toISOString().slice(0, 10);

const run = async () => {
    const event = await prisma.calendarEvent.create({
        data: { title, description, date }
    });
    console.log('Событие создано:', event);
    process.exit(0);
};

run(); 