const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('tech', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'tech@example.com' },
        update: {},
        create: {
            email: 'tech@example.com',
            password: hashedPassword,
            name: 'Tech',
            role: 2
        }
    });

    console.log('Admin user created:', admin);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 