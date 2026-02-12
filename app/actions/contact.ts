"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitContactMessage(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !message) {
        return { success: false, error: "Please fill in all required fields." };
    }

    try {
        await prisma.message.create({
            data: {
                name,
                email,
                subject: subject || "No Subject",
                message,
            },
        });

        revalidatePath("/contact");
        return { success: true, message: "Message sent successfully!" };
    } catch (error) {
        console.error("Failed to submit contact message:", error);
        return { success: false, error: "Something went wrong. Please try again." };
    }
}
