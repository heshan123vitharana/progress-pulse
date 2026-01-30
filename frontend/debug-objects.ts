
import { prisma } from './lib/prisma';

async function main() {
    console.log("Starting debug script...");
    try {
        console.log("Fetching objects...");
        const objects = await prisma.objects.findMany({
            include: {
                module: true,
                sub_objects: true,
            },
            orderBy: { created_at: 'desc' },
        });

        console.log("Objects fetched successfully. Logic check for BigInt serialization:");
        const safeObjects = JSON.parse(JSON.stringify(objects, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));
        console.log("Serialization success. Count:", safeObjects.length);

    } catch (error: any) {
        console.error("DEBUG ERROR:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
