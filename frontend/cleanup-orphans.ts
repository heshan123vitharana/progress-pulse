
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const modules = await prisma.modules.findMany();
        const projects = await prisma.projects.findMany();
        const projectIds = new Set(projects.map(p => p.project_id.toString()));

        // Find orphans
        const orphans = modules.filter(m => !projectIds.has(m.project_id.toString()));

        if (orphans.length > 0) {
            console.log(`Deleting ${orphans.length} orphaned modules...`);
            const orphanIds = orphans.map(o => o.id);

            await prisma.modules.deleteMany({
                where: {
                    id: { in: orphanIds }
                }
            });
            console.log('Cleanup complete.');
        } else {
            console.log('No orphans found.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
