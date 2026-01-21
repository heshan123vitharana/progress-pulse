import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    console.log("Authorize called with:", credentials?.email);
                    if (!credentials?.email || !credentials?.password) {
                        console.log("Missing credentials");
                        return null;
                    }

                    const user = await prisma.users.findFirst({
                        where: {
                            email: credentials.email,
                        },
                    });

                    if (!user) {
                        console.log("User not found:", credentials.email);
                        return null;
                    }
                    console.log("User found, validating password for:", user.email);
                    console.log("Provided Password Length:", credentials.password.length);
                    console.log("Stored Hash Length:", user.password.length);
                    console.log("Provided Password Start/End:", credentials.password.substring(0, 2), "...", credentials.password.substring(credentials.password.length - 2));

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        console.log("Invalid password for:", user.email);
                        return null;
                    }
                    console.log("Login successful for:", user.email);

                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: user.name,
                        employee_id: user.employee_id,
                        role_id: user.role_id ? Number(user.role_id) : null,
                    };
                } catch (error) {
                    console.error("Authorize error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        session: ({ session, token }) => {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    employee_id: token.employee_id,
                    role_id: token.role_id,
                },
            };
        },
        jwt: ({ token, user }) => {
            if (user) {
                const u = user as any;
                return {
                    ...token,
                    id: u.id,
                    employee_id: u.employee_id,
                    role_id: u.role_id,
                };
            }
            return token;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
