import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Department } from '@prisma/client';

// Parse marks strings like "9/10", "85", "7.5/10", "" → a numeric score (or -1 if empty)
function parseMarks(marks: string): number {
    if (!marks || marks.trim() === '') return -1;
    // Handle "X/Y" format — use X as the raw score
    const slashMatch = marks.match(/^([\d.]+)\s*\/\s*([\d.]+)$/);
    if (slashMatch) {
        const num = parseFloat(slashMatch[1]);
        return isNaN(num) ? -1 : num;
    }
    const num = parseFloat(marks);
    return isNaN(num) ? -1 : num;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const departmentParam = searchParams.get('department');
        const featuredParam = searchParams.get('featured');
        const isFeatured = featuredParam === 'true';

        const where: any = {};

        if (departmentParam && Object.values(Department).includes(departmentParam as Department)) {
            where.department = departmentParam as Department;
        }

        const projects = await prisma.project.findMany({
            where,
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

        if (isFeatured) {
            // Pick the best project per department (highest marks → newest date)
            const bestByDept = new Map<string, typeof projects[number]>();
            for (const project of projects) {
                const existing = bestByDept.get(project.department);
                if (!existing) {
                    bestByDept.set(project.department, project);
                } else {
                    const existingScore = parseMarks(existing.marks);
                    const newScore = parseMarks(project.marks);
                    if (
                        newScore > existingScore ||
                        (newScore === existingScore &&
                            new Date(project.createdAt) > new Date(existing.createdAt))
                    ) {
                        bestByDept.set(project.department, project);
                    }
                }
            }
            // Sort department representatives: highest marks first, then newest
            const representatives = Array.from(bestByDept.values()).sort((a, b) => {
                const marksA = parseMarks(a.marks);
                const marksB = parseMarks(b.marks);
                if (marksB !== marksA) return marksB - marksA;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            return NextResponse.json(representatives.slice(0, 3));
        }

        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching public projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}

