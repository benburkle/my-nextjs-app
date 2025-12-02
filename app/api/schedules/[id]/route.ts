import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
      include: {
        studies: {
          include: {
            resource: true,
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch schedule',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { day, timeStart, repeats, starts, ends, excludeDayOfWeek, excludeDate } = body;

    if (!day || typeof day !== 'string' || day.trim() === '') {
      return NextResponse.json(
        { error: 'Day is required', details: 'Day must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!timeStart || typeof timeStart !== 'string' || timeStart.trim() === '') {
      return NextResponse.json(
        { error: 'Time start is required', details: 'Time start must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!repeats || typeof repeats !== 'string' || repeats.trim() === '') {
      return NextResponse.json(
        { error: 'Repeats is required', details: 'Repeats must be a non-empty string' },
        { status: 400 }
      );
    }

    // Verify schedule belongs to user
    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!existingSchedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    const schedule = await prisma.schedule.update({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
      data: {
        day: day.trim(),
        timeStart: timeStart.trim(),
        repeats: repeats.trim(),
        starts: starts ? new Date(starts) : null,
        ends: ends ? new Date(ends) : null,
        excludeDayOfWeek: excludeDayOfWeek || null,
        excludeDate: excludeDate ? new Date(excludeDate) : null,
      },
      include: {
        studies: {
          include: {
            resource: true,
          },
        },
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      {
        error: 'Failed to update schedule',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify schedule belongs to user
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    await prisma.schedule.delete({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete schedule',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
