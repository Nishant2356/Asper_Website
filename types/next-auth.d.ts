import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Role, Department } from "@prisma/client";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: Role;
            domain: Department[];
        } & DefaultSession["user"];
    }

    interface User {
        role: Role;
        domain: Department[];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: Role;
        domain: Department[];
        id: string;
    }
}
