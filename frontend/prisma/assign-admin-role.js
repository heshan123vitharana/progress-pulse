// Script to assign admin role to users
// Run with: node prisma/assign-admin-role.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🔐 Assigning admin role to users...\n');

    // Find the admin role
    const adminRole = await prisma.roles.findFirst({
        where: { slug: 'admin' }
    });

    if (!adminRole) {
        console.log('❌ Admin role not found! Run the seed-permissions.js script first.');
        return;
    }

    console.log(`✓ Found admin role: ${adminRole.name} (ID: ${adminRole.id})`);

    // Get all users without roles
    const usersWithoutRoles = await prisma.users.findMany({
        where: { role_id: null }
    });

    console.log(`\n📋 Found ${usersWithoutRoles.length} users without roles:\n`);

    for (const user of usersWithoutRoles) {
        console.log(`  - ${user.name} (${user.email})`);
    }

    if (usersWithoutRoles.length === 0) {
        console.log('\n✅ All users already have roles assigned!');
        return;
    }

    // Assign admin role to all users (for now)
    console.log('\n🔄 Assigning admin role to all users...');

    for (const user of usersWithoutRoles) {
        await prisma.users.update({
            where: { id: user.id },
            data: { role_id: adminRole.id }
        });
        console.log(`  ✓ Assigned admin role to: ${user.name}`);
    }

    console.log('\n🎉 Done! All users now have the admin role.');
    console.log('   You can change individual user roles via the Roles page.');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
