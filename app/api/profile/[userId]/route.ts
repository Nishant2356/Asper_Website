import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// ─── GET: Fetch a user's profile ─────────────────────
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,

                bio: true,
                profilePhoto: true,
                birthDate: true,
                college: true,
                branch: true,
                year: true,
                otherCollegeName: true,
                // position: true,
                domains: {
                    select: {
                        id: true,
                        department: true,
                        position: true,
                    },
                },
                github: true,
                linkedin: true,
                instagram: true,
                twitter: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// ─── PATCH: Update profile ────────────────────────────
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { userId } = await params;

        if (
            session.user.id !== userId &&
            session.user.role !== "ADMIN"
        ) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const body = await req.json();

        // Free fields — no approval needed
        const editableFields = [
            "bio",
            "profilePhoto",
            "github",
            "linkedin",
            "instagram",
            "twitter",
        ];

        // Restricted fields — need approval for non-admins
        const approvalFields = ["position", "birthDate", "name", "college", "branch", "year", "otherCollegeName"];

        const directUpdate: Record<string, any> = {};
        const approvalRequests: Promise<any>[] = [];

        for (const key of editableFields) {
            if (body[key] !== undefined) {
                directUpdate[key] = body[key];
            }
        }

        if (session.user.role !== "ADMIN") {
            for (const field of approvalFields) {
                if (body[field] !== undefined) {
                    const currentUser = await prisma.user.findUnique({
                        where: { id: userId },
                        select: { [field]: true },
                    });
                    // check previouse request is panding or not
                    const existingRequest = await prisma.profileUpdateRequest.findFirst({
                        where: {
                            userId,
                            field,
                            status: "PENDING",
                        },
                    });

                    if (existingRequest) {
                        return NextResponse.json(
                            {
                                error: `You already have a pending request for ${field}.`,
                                message: "Please wait for admin approval before submitting another request."
                            },
                            { status: 400 }
                        );
                    }

                    // If the field is different from the current value, create a request for admin approval
                    if (
                        currentUser &&
                        String(currentUser[field]) !== String(body[field])
                    ) {
                        approvalRequests.push(
                            prisma.profileUpdateRequest.create({
                                data: {
                                    userId,
                                    field,
                                    oldValue: currentUser
                                        ? String(
                                            (currentUser as any)[field] ?? ""
                                        )
                                        : "",
                                    newValue: String(body[field]),
                                    status: "PENDING",
                                },
                            })
                        );
                    }
                }
            }
        } else {
            for (const field of approvalFields) {
                if (body[field] === undefined) continue;

                if (field === "birthDate") {
                    if (!body.birthDate) {
                        directUpdate.birthDate = null;
                    } else {
                        const date = new Date(body.birthDate);

                        if (!isNaN(date.getTime())) {
                            directUpdate.birthDate = date;
                        }
                    }
                } else {
                    directUpdate[field] = body[field];
                }
            }
        }
        // birth date validation
        if (directUpdate.birthDate) {
            const birthDate = new Date(directUpdate.birthDate);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 0 || age > 150) {
                return NextResponse.json(
                    { error: "Invalid birth date" },
                    { status: 400 }
                );
            }
            directUpdate.birthDate = new Date(body.birthDate);
        }
        // birth date not undifined
        if (directUpdate.birthDate === null) {
            return NextResponse.json(
                { error: "Birth date cannot be empty" },
                { status: 400 }
            );
        }   


        const updatedUser =
            Object.keys(directUpdate).length > 0
                ? await prisma.user.update({
                    where: { id: userId },
                    data: directUpdate,
                    select: {
                        id: true,
                        name: true,
                        bio: true,
                        profilePhoto: true,
                        // position: true,
                        birthDate: true,
                        github: true,
                        linkedin: true,
                        instagram: true,
                        twitter: true,
                        college: true,
                        branch: true,
                        year: true,
                        otherCollegeName: true,
                    },
                })
                : null;

        await Promise.all(approvalRequests);

        return NextResponse.json({
            success: true,
            user: updatedUser,
            pendingApprovals: approvalRequests.length > 0,
            message:
                approvalRequests.length > 0
                    ? "Some fields require admin approval and have been submitted for review."
                    : "Profile updated successfully.",
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
// edit team status


// ─── DELETE: Admin only ───────────────────────────────
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden. Admin access required." },
                { status: 403 }
            );
        }

        const { userId } = await params;

        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}