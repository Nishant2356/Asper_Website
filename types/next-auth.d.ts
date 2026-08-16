import type { DefaultSession } from "next-auth";
import type { Department, Role } from "@prisma/client";

declare module "next-auth" {
    interface User {
        role: Role;
        domain: Department[];
    }

    interface Session {
        user: {
            id: string;
            role: Role;
            domain: Department[];
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        role?: Role;
        domain?: Department[];
    }
}