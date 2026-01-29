import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Department } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, department, githubLink, liveLink, imageLinks, doubts } = body;

        if (!name || !department) {
            return NextResponse.json(
                { error: 'Name and Department are required' },
                { status: 400 }
            );
        }

        // Validate department enum
        if (!Object.values(Department).includes(department as Department)) {
            return NextResponse.json(
                { error: 'Invalid department' },
                { status: 400 }
            );
        }

        const project = await prisma.project.create({
            data: {
                name,
                department: department as Department,
                githubLink,
                liveLink,
                imageLinks: imageLinks || [],
                doubts,
            },
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const checkedParam = searchParams.get('checked');

        const where: any = {};
        if (checkedParam !== null) {
            where.checked = checkedParam === 'true';
        }

        const projects = await prisma.project.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}
