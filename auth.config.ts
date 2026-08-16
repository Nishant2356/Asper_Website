import type { NextAuthConfig } from "next-auth";
import type { Department, Role } from "@prisma/client";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.domain = user.domain; // JWT mein Department[]
            }

            if (trigger === "update" && session) {
                token = { ...token, ...session };
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as Role;
                session.user.domain = (token.domain ?? []) as Department[];
            }

            return session;
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
