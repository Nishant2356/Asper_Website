import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Department } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const departmentParam = searchParams.get('department');
        const featuredParam = searchParams.get('featured');

        const where: any = {};

        if (departmentParam && Object.values(Department).includes(departmentParam as Department)) {
            where.department = departmentParam as Department;
        }

        const take = featuredParam === 'true' ? 3 : undefined;

        const projects = await prisma.project.findMany({
            where,
            take,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                department: true,
                githubLink: true,
                liveLink: true,
                imageLinks: true,
                marks: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching public projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}
