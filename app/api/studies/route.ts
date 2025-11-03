import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const studies = await prisma.study.findMany({
      include: {
        schedule: true,
        resource: true,
        sessions: {
          orderBy: {
            date: 'desc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(studies);
  } catch (error) {
    console.error('Error fetching studies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch studies', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, scheduleId, resourceId } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    const study = await prisma.study.create({
      data: {
        name,
        scheduleId: parseInt(scheduleId),
        resourceId: parseInt(resourceId),
      },
      include: {
        schedule: true,
        resource: true,
        sessions: true,
      },
    });

    return NextResponse.json(study, { status: 201 });
  } catch (error) {
    console.error('Error creating study:', error);
    return NextResponse.json(
      { error: 'Failed to create study', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
