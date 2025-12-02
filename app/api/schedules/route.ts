import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schedules = await prisma.schedule.findMany({
      where: {
        userId: user.id,
      },
      include: {
        studies: true,
      },
      orderBy: {
        day: 'asc',
      },
    });
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch schedules',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const schedule = await prisma.schedule.create({
      data: {
        day: day.trim(),
        userId: user.id,
        timeStart: timeStart.trim(),
        repeats: repeats.trim(),
        starts: starts ? new Date(starts) : null,
        ends: ends ? new Date(ends) : null,
        excludeDayOfWeek: excludeDayOfWeek || null,
        excludeDate: excludeDate ? new Date(excludeDate) : null,
      },
      include: {
        studies: true,
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      {
        error: 'Failed to create schedule',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
