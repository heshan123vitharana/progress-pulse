import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            employee_id?: number | null;
            role_id?: number | null;
            role_slug?: string | null;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            avatar?: string | null;
        };
    }

    interface User extends DefaultUser {
        id: string;
        employee_id?: number | null;
        role_id?: number | null;
        role_slug?: string | null;
        avatar?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        employee_id?: number | null;
        role_id?: number | null;
        role_slug?: string | null;
        avatar?: string | null;
    }
}
