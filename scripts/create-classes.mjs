import { prisma } from '../src/lib/prisma.js';

const classes = [
    { name: '1А' },
    { name: '2Б' },
    { name: '3В' },
    { name: '4Г' }
];

const run = async () => {
    for (const cls of classes) {
        await prisma.class.create({ data: cls });
    }
    console.log('Классы созданы');
    process.exit(0);
};

run(); 