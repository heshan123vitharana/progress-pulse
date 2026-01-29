
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const modules = await prisma.modules.findMany();
        const projects = await prisma.projects.findMany();

        const projectIds = new Set(projects.map(p => p.project_id.toString()));

        const orphans = modules.filter(m => !projectIds.has(m.project_id.toString()));

        console.log(`Total Modules: ${modules.length}`);
        console.log(`Total Projects: ${projects.length}`);
        console.log(`Orphaned Modules: ${orphans.length}`);

        if (orphans.length > 0) {
            console.log('Orphan IDs:', orphans.map(o => o.id.toString()));
            console.log('Orphan Project IDs:', orphans.map(o => o.project_id.toString()));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
