/**
 * ─── /api/projects/[id] ─────────────────────────────────
 *
 * PATCH:  Update project (marks, feedback, checked, accepted)
 * DELETE: Remove a project
 *
 * Both operations INVALIDATE all project caches because:
 * - PATCH changes marks/status → affects both user dashboard and public showcase
 * - DELETE removes a project → affects all listings
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cacheInvalidate } from "@/lib/cache";
import { apiLimiter, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        const ip = getClientIp(request);
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) return rateLimitResponse(reset, limit, remaining);

        const { id } = await params;
        const body = await request.json();
        const { checked, accepted, marks, feedback } = body;

        const data: any = {};
        if (checked !== undefined) data.checked = checked;
        if (accepted !== undefined) data.accepted = accepted;
        if (marks !== undefined) data.marks = String(marks);
        if (feedback !== undefined) data.feedback = String(feedback);

        const project = await prisma.project.update({
            where: { id },
            data,
        });

        // ─── INVALIDATE: project updated → refresh all listings ───
        await cacheInvalidate("projects:*");

        return NextResponse.json(project);
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // ─── RATE LIMIT CHECK ────────────────────────────
        const ip = getClientIp(request);
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) return rateLimitResponse(reset, limit, remaining);

        const { id } = await params;

        await prisma.project.delete({
            where: { id },
        });

        // ─── INVALIDATE: project removed → refresh all listings ───
        await cacheInvalidate("projects:*");

        return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        );
    }
}
