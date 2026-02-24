import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
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
        const { id } = await params;

        await prisma.project.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        );
    }
}
