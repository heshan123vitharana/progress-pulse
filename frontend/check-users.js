const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.users.findMany();
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- ID: ${u.id}, Email: ${u.email}, Name: ${u.name}, Role ID: ${u.role_id}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
