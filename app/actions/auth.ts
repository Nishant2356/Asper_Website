"use server";

import { cookies } from "next/headers";

export async function login(password: string) {
    if (password === process.env.ADMIN_PASSWORD) {
        // Await the cookies() promise
        const cookieStore = await cookies();

        // Set the cookie
        cookieStore.set("admin_session", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        });

        return { success: true };
    }

    return { success: false, error: "Incorrect password" };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
}
