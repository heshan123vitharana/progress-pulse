const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Ensure Admin Role exists
        let adminRole = await prisma.roles.findFirst({
            where: { name: 'Admin' }
        });

        if (!adminRole) {
            console.log('Creating Admin role...');
            adminRole = await prisma.roles.create({
                data: {
                    name: 'Admin',
                    slug: 'admin',
                    description: 'Administrator with full access',
                    status: 'active'
                }
            });
            console.log('Admin role created with ID:', adminRole.id);
        } else {
            console.log('Admin role already exists with ID:', adminRole.id);
        }

        // 2. Create Admin User
        const email = 'admin@example.com';
        const password = 'password123';

        const existingUser = await prisma.users.findUnique({
            where: { email }
        });

        if (!existingUser) {
            console.log(`Creating user ${email}...`);
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.users.create({
                data: {
                    name: 'Admin User',
                    email: email,
                    password: hashedPassword,
                    role_id: adminRole.id,
                    status: 'active',
                    email_verified_at: new Date()
                }
            });
            console.log(`User created! Login with: ${email} / ${password}`);
        } else {
            console.log(`User ${email} already exists.`);
            // Optional: Reset password if needed, but for now just notify.
        }

    } catch (e) {
        console.error('Error creating admin user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
