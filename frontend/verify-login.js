const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@example.com';
    const password = 'password123';

    console.log(`Checking login for ${email}...`);

    try {
        const user = await prisma.users.findFirst({
            where: { email }
        });

        if (!user) {
            console.log('❌ User not found in DB!');
            return;
        }

        console.log('✅ User found:', user.id, user.name);
        console.log('Stored Hash:', user.password);

        const isValid = await bcrypt.compare(password, user.password);

        if (isValid) {
            console.log('✅ Password Match! Bcrypt verification successful.');
        } else {
            console.log('❌ Password Mismatch! The stored hash does not match "password123".');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
