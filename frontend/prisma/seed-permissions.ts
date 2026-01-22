// Seed script for roles and permissions
// Run with: npx ts-node prisma/seed-permissions.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define all permissions grouped by category
const PERMISSIONS = {
    // Dashboard
    dashboard: [
        { name: 'View Dashboard', slug: 'view_dashboard' },
    ],
    // Employees
    employees: [
        { name: 'View Employees', slug: 'view_employees' },
        { name: 'Create Employees', slug: 'create_employees' },
        { name: 'Edit Employees', slug: 'edit_employees' },
        { name: 'Delete Employees', slug: 'delete_employees' },
    ],
    // Tasks
    tasks: [
        { name: 'View Tasks', slug: 'view_tasks' },
        { name: 'Create Tasks', slug: 'create_tasks' },
        { name: 'Edit Tasks', slug: 'edit_tasks' },
        { name: 'Delete Tasks', slug: 'delete_tasks' },
        { name: 'Assign Tasks', slug: 'assign_tasks' },
        { name: 'Accept Tasks', slug: 'accept_tasks' },
        { name: 'QA Tasks', slug: 'qa_tasks' },
        { name: 'Complete Tasks', slug: 'complete_tasks' },
    ],
    // Projects
    projects: [
        { name: 'View Projects', slug: 'view_projects' },
        { name: 'Create Projects', slug: 'create_projects' },
        { name: 'Edit Projects', slug: 'edit_projects' },
        { name: 'Delete Projects', slug: 'delete_projects' },
    ],
    // Modules
    modules: [
        { name: 'View Modules', slug: 'view_modules' },
        { name: 'Create Modules', slug: 'create_modules' },
        { name: 'Edit Modules', slug: 'edit_modules' },
        { name: 'Delete Modules', slug: 'delete_modules' },
    ],
    // Objects
    objects: [
        { name: 'View Objects', slug: 'view_objects' },
        { name: 'Manage Objects', slug: 'manage_objects' },
    ],
    // Customers
    customers: [
        { name: 'View Customers', slug: 'view_customers' },
        { name: 'Create Customers', slug: 'create_customers' },
        { name: 'Edit Customers', slug: 'edit_customers' },
        { name: 'Delete Customers', slug: 'delete_customers' },
        { name: 'View Customer Tasks', slug: 'view_customer_tasks' },
    ],
    // Reports
    reports: [
        { name: 'View Reports', slug: 'view_reports' },
        { name: 'Export Reports', slug: 'export_reports' },
        { name: 'View Analytics', slug: 'view_analytics' },
    ],
    // Administration
    admin: [
        { name: 'Manage Users', slug: 'manage_users' },
        { name: 'Manage Roles', slug: 'manage_roles' },
        { name: 'Manage Permissions', slug: 'manage_permissions' },
        { name: 'Manage Departments', slug: 'manage_departments' },
        { name: 'Manage Designations', slug: 'manage_designations' },
        { name: 'View Activity Logs', slug: 'view_activity_logs' },
        { name: 'System Settings', slug: 'system_settings' },
    ],
    // Timesheet
    timesheet: [
        { name: 'View Timesheet', slug: 'view_timesheet' },
        { name: 'Manage Timesheet', slug: 'manage_timesheet' },
    ],
};

// Define roles and their permissions
const ROLES = {
    admin: {
        name: 'Admin',
        description: 'Full system access with all permissions',
        permissions: 'all', // Special flag for all permissions
    },
    manager: {
        name: 'Manager',
        description: 'Project and team management',
        permissions: [
            'view_dashboard',
            'view_employees', 'create_employees', 'edit_employees',
            'view_tasks', 'create_tasks', 'edit_tasks', 'assign_tasks',
            'view_projects', 'create_projects', 'edit_projects',
            'view_modules', 'create_modules', 'edit_modules',
            'view_objects', 'manage_objects',
            'view_customers', 'create_customers', 'edit_customers', 'view_customer_tasks',
            'view_reports', 'export_reports', 'view_analytics',
            'manage_departments', 'manage_designations',
            'view_timesheet', 'manage_timesheet',
        ],
    },
    qa: {
        name: 'QA',
        description: 'Quality assurance and task review',
        permissions: [
            'view_dashboard',
            'view_employees',
            'view_tasks', 'qa_tasks', 'edit_tasks',
            'view_projects',
            'view_modules',
            'view_objects',
            'view_customer_tasks',
            'view_reports',
            'view_timesheet',
        ],
    },
    implementation_officer: {
        name: 'Implementation Officer',
        description: 'Project implementation and deployment',
        permissions: [
            'view_dashboard',
            'view_employees',
            'view_tasks', 'create_tasks', 'edit_tasks', 'assign_tasks', 'complete_tasks',
            'view_projects', 'edit_projects',
            'view_modules', 'create_modules', 'edit_modules',
            'view_objects', 'manage_objects',
            'view_customers', 'view_customer_tasks',
            'view_reports',
            'view_timesheet', 'manage_timesheet',
        ],
    },
    developer: {
        name: 'Developer',
        description: 'Development tasks and coding',
        permissions: [
            'view_dashboard',
            'view_tasks', 'create_tasks', 'edit_tasks', 'accept_tasks', 'complete_tasks',
            'view_projects',
            'view_modules',
            'view_objects',
            'view_timesheet', 'manage_timesheet',
        ],
    },
};

async function main() {
    console.log('🌱 Starting seed for roles and permissions...\n');

    // 1. Create all permissions
    console.log('📋 Creating permissions...');
    const allPermissions: { name: string; slug: string }[] = [];
    for (const category of Object.values(PERMISSIONS)) {
        allPermissions.push(...category);
    }

    for (const perm of allPermissions) {
        await prisma.permissions.upsert({
            where: { slug: perm.slug },
            update: { name: perm.name },
            create: {
                name: perm.name,
                slug: perm.slug,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
        console.log(`  ✓ ${perm.name}`);
    }
    console.log(`\n✅ Created ${allPermissions.length} permissions\n`);

    // 2. Get all permission IDs for mapping
    const permissionRecords = await prisma.permissions.findMany();
    const permissionMap = new Map(permissionRecords.map(p => [p.slug, p.id]));

    // 3. Create roles and assign permissions
    console.log('👥 Creating roles...');
    for (const [key, roleData] of Object.entries(ROLES)) {
        // Create or update role
        const role = await prisma.roles.upsert({
            where: { slug: key },
            update: {
                name: roleData.name,
                description: roleData.description,
                updated_at: new Date(),
            },
            create: {
                name: roleData.name,
                description: roleData.description,
                slug: key,
                status: 'active',
                created_at: new Date(),
                updated_at: new Date(),
            },
        });

        // Delete existing role permissions
        await prisma.roles_permissions.deleteMany({
            where: { role_id: role.id },
        });

        // Determine which permissions to assign
        let permissionsToAssign: string[];
        if (roleData.permissions === 'all') {
            permissionsToAssign = allPermissions.map(p => p.slug);
        } else {
            permissionsToAssign = roleData.permissions as string[];
        }

        // Create role-permission relationships
        for (const permSlug of permissionsToAssign) {
            const permId = permissionMap.get(permSlug);
            if (permId) {
                await prisma.roles_permissions.create({
                    data: {
                        role_id: role.id,
                        permission_id: permId,
                    },
                });
            }
        }

        console.log(`  ✓ ${roleData.name} (${permissionsToAssign.length} permissions)`);
    }
    console.log(`\n✅ Created ${Object.keys(ROLES).length} roles\n`);

    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
