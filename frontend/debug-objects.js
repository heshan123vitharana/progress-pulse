const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function main() {
    console.log("Starting JS debug...");
    try {
        const objects = await prisma.objects.findMany({
            include: {
                module: true,
                sub_objects: true,
            },
            orderBy: { created_at: 'desc' },
        });
        console.log("Fetched:", objects.length);
        console.log("First Object:", JSON.stringify(objects[0], (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));
    } catch (e) {
        console.error("DEBUG ERROR:", e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
