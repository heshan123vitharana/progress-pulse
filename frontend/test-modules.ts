
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing modules query...');
        const modules = await prisma.modules.findMany({
            include: {
                project: {
                    select: {
                        project_id: true,
                        project_name: true,
                        project_code: true
                    }
                }
            },
            orderBy: { created_at: 'desc' },
        });
        console.log('Query successful. Count:', modules.length);
        if (modules.length > 0) {
            console.log('First module:', JSON.stringify(modules[0], (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
                , 2));
        }
    } catch (e) {
        console.error('ERROR OCCURRED:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
