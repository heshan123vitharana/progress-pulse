// Permission checking utilities
// Used for role-based access control throughout the application

import { prisma } from '@/lib/prisma';

// All permission slugs in the system
export const PERMISSIONS = {
    // Dashboard
    VIEW_DASHBOARD: 'view_dashboard',

    // Employees
    VIEW_EMPLOYEES: 'view_employees',
    CREATE_EMPLOYEES: 'create_employees',
    EDIT_EMPLOYEES: 'edit_employees',
    DELETE_EMPLOYEES: 'delete_employees',

    // Tasks
    VIEW_TASKS: 'view_tasks',
    CREATE_TASKS: 'create_tasks',
    EDIT_TASKS: 'edit_tasks',
    DELETE_TASKS: 'delete_tasks',
    ASSIGN_TASKS: 'assign_tasks',
    ACCEPT_TASKS: 'accept_tasks',
    QA_TASKS: 'qa_tasks',
    COMPLETE_TASKS: 'complete_tasks',

    // Projects
    VIEW_PROJECTS: 'view_projects',
    CREATE_PROJECTS: 'create_projects',
    EDIT_PROJECTS: 'edit_projects',
    DELETE_PROJECTS: 'delete_projects',

    // Modules
    VIEW_MODULES: 'view_modules',
    CREATE_MODULES: 'create_modules',
    EDIT_MODULES: 'edit_modules',
    DELETE_MODULES: 'delete_modules',

    // Objects
    VIEW_OBJECTS: 'view_objects',
    MANAGE_OBJECTS: 'manage_objects',

    // Customers
    VIEW_CUSTOMERS: 'view_customers',
    CREATE_CUSTOMERS: 'create_customers',
    EDIT_CUSTOMERS: 'edit_customers',
    DELETE_CUSTOMERS: 'delete_customers',
    VIEW_CUSTOMER_TASKS: 'view_customer_tasks',

    // Reports
    VIEW_REPORTS: 'view_reports',
    EXPORT_REPORTS: 'export_reports',
    VIEW_ANALYTICS: 'view_analytics',

    // Administration
    MANAGE_USERS: 'manage_users',
    MANAGE_ROLES: 'manage_roles',
    MANAGE_PERMISSIONS: 'manage_permissions',
    MANAGE_DEPARTMENTS: 'manage_departments',
    MANAGE_DESIGNATIONS: 'manage_designations',
    VIEW_ACTIVITY_LOGS: 'view_activity_logs',
    SYSTEM_SETTINGS: 'system_settings',

    // Timesheet
    VIEW_TIMESHEET: 'view_timesheet',
    MANAGE_TIMESHEET: 'manage_timesheet',
} as const;

export type PermissionSlug = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role slugs
export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    QA: 'qa',
    IMPLEMENTATION_OFFICER: 'implementation_officer',
    DEVELOPER: 'developer',
} as const;

export type RoleSlug = typeof ROLES[keyof typeof ROLES];

// Cache for user permissions (in-memory, cleared on server restart)
const permissionCache = new Map<string, { permissions: string[], timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get all permissions for a user based on their role
 */
export async function getUserPermissions(userId: string | number): Promise<string[]> {
    const cacheKey = String(userId);
    const cached = permissionCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.permissions;
    }

    try {
        const user = await prisma.users.findUnique({
            where: { id: BigInt(userId) },
            include: {
                role: {
                    include: {
                        role_permissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                }
            }
        });

        if (!user || !user.role) {
            return [];
        }

        const permissions = user.role.role_permissions.map(
            (rp: any) => rp.permission.slug
        );

        permissionCache.set(cacheKey, {
            permissions,
            timestamp: Date.now()
        });

        return permissions;
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        return [];
    }
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(
    userId: string | number,
    permission: PermissionSlug
): Promise<boolean> {
    const permissions = await getUserPermissions(userId);
    return permissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 */
export async function hasAnyPermission(
    userId: string | number,
    requiredPermissions: PermissionSlug[]
): Promise<boolean> {
    const permissions = await getUserPermissions(userId);
    return requiredPermissions.some(p => permissions.includes(p));
}

/**
 * Check if a user has all of the specified permissions
 */
export async function hasAllPermissions(
    userId: string | number,
    requiredPermissions: PermissionSlug[]
): Promise<boolean> {
    const permissions = await getUserPermissions(userId);
    return requiredPermissions.every(p => permissions.includes(p));
}

/**
 * Clear the permission cache for a user (call after role changes)
 */
export function clearPermissionCache(userId?: string | number) {
    if (userId) {
        permissionCache.delete(String(userId));
    } else {
        permissionCache.clear();
    }
}

/**
 * Get the role name for a user
 */
export async function getUserRole(userId: string | number): Promise<string | null> {
    try {
        const user = await prisma.users.findUnique({
            where: { id: BigInt(userId) },
            include: { role: true }
        });
        return user?.role?.slug || null;
    } catch (error) {
        console.error('Error fetching user role:', error);
        return null;
    }
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string | number): Promise<boolean> {
    const role = await getUserRole(userId);
    return role === ROLES.ADMIN;
}

// Menu items with required permissions
export const MENU_PERMISSIONS: Record<string, PermissionSlug[]> = {
    '/dashboard': [PERMISSIONS.VIEW_DASHBOARD],
    '/employees': [PERMISSIONS.VIEW_EMPLOYEES],
    '/tasks': [PERMISSIONS.VIEW_TASKS],
    '/timesheet': [PERMISSIONS.VIEW_TIMESHEET],
    '/projects': [PERMISSIONS.VIEW_PROJECTS],
    '/modules': [PERMISSIONS.VIEW_MODULES],
    '/objects': [PERMISSIONS.VIEW_OBJECTS],
    '/customers': [PERMISSIONS.VIEW_CUSTOMERS],
    '/departments': [PERMISSIONS.MANAGE_DEPARTMENTS],
    '/designations': [PERMISSIONS.MANAGE_DESIGNATIONS],
    '/reports': [PERMISSIONS.VIEW_REPORTS],
    '/analytics': [PERMISSIONS.VIEW_ANALYTICS],
    '/users': [PERMISSIONS.MANAGE_USERS],
    '/roles': [PERMISSIONS.MANAGE_ROLES],
    '/activity-logs': [PERMISSIONS.VIEW_ACTIVITY_LOGS],
};

/**
 * Filter menu items based on user permissions
 */
export async function getAccessibleMenuItems(
    userId: string | number,
    menuItems: { href: string; name: string }[]
): Promise<{ href: string; name: string }[]> {
    const permissions = await getUserPermissions(userId);

    return menuItems.filter(item => {
        const requiredPerms = MENU_PERMISSIONS[item.href];
        if (!requiredPerms || requiredPerms.length === 0) {
            return true; // No specific permission required
        }
        return requiredPerms.some(p => permissions.includes(p));
    });
}
