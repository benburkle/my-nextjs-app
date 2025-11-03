import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const study = await prisma.study.findUnique({
      where: { id: parseInt(id) },
      include: {
        schedule: true,
        resource: true,
        sessions: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!study) {
      return NextResponse.json(
        { error: 'Study not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(study);
  } catch (error) {
    console.error('Error fetching study:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const study = await prisma.study.update({
      where: { id: parseInt(id) },
      data: {
        name,
        scheduleId: parseInt(scheduleId),
        resourceId: parseInt(resourceId),
      },
      include: {
        schedule: true,
        resource: true,
        sessions: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    return NextResponse.json(study);
  } catch (error) {
    console.error('Error updating study:', error);
    return NextResponse.json(
      { error: 'Failed to update study', details: error instanceof Error ? error.message : 'Unknown error' },
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
    await prisma.study.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting study:', error);
    return NextResponse.json(
      { error: 'Failed to delete study', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
