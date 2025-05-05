import { prisma } from '../src/lib/prisma.ts';
import bcrypt from 'bcryptjs';

const email = process.argv[2] || 'user@example.com';
const password = process.argv[3] || '123123';
const name = process.argv[4] || 'User';
const role = Number(process.argv[5]) || 1;

const run = async () => {
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { email, password: hash, name, role }
    });
    console.log('User created:', user);
    process.exit(0);
};

run(); 