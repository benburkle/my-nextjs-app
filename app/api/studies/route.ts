import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studies = await prisma.study.findMany({
      where: {
        userId: user.id,
      },
      include: {
        schedule: true,
        resource: true,
        guide: true,
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
      {
        error: 'Failed to fetch studies',
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
    const { name, scheduleId, resourceId, guideId } = body;

    console.log('Creating study with data:', { name, scheduleId, resourceId });

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required', details: 'Name must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate resource if provided
    let parsedResourceId: number | null = null;
    if (resourceId) {
      parsedResourceId = parseInt(resourceId);
      if (isNaN(parsedResourceId)) {
        return NextResponse.json(
          {
            error: 'Invalid Resource ID',
            details: `Resource ID must be a valid number. Received: ${resourceId}`,
          },
          { status: 400 }
        );
      }

      // Check if resource exists and belongs to user
      const resource = await prisma.resource.findFirst({
        where: {
          id: parsedResourceId,
          userId: user.id,
        },
      });

      if (!resource) {
        return NextResponse.json(
          {
            error: 'Resource not found',
            details: `Resource with ID ${parsedResourceId} does not exist`,
          },
          { status: 404 }
        );
      }
    }

    // Validate schedule if provided
    let parsedScheduleId: number | null = null;
    if (scheduleId) {
      parsedScheduleId = parseInt(scheduleId);
      if (isNaN(parsedScheduleId)) {
        return NextResponse.json(
          {
            error: 'Invalid Schedule ID',
            details: `Schedule ID must be a valid number. Received: ${scheduleId}`,
          },
          { status: 400 }
        );
      }

      // Check if schedule exists and belongs to user
      const schedule = await prisma.schedule.findFirst({
        where: {
          id: parsedScheduleId,
          userId: user.id,
        },
      });

      if (!schedule) {
        return NextResponse.json(
          {
            error: 'Schedule not found',
            details: `Schedule with ID ${parsedScheduleId} does not exist`,
          },
          { status: 404 }
        );
      }
    }

    // Validate guide if provided
    let parsedGuideId: number | null = null;
    if (guideId) {
      parsedGuideId = parseInt(guideId);
      if (isNaN(parsedGuideId)) {
        return NextResponse.json(
          {
            error: 'Invalid Guide ID',
            details: `Guide ID must be a valid number. Received: ${guideId}`,
          },
          { status: 400 }
        );
      }

      // Check if guide exists and belongs to user
      const guide = await prisma.guide.findFirst({
        where: {
          id: parsedGuideId,
          userId: user.id,
        },
      });

      if (!guide) {
        return NextResponse.json(
          { error: 'Guide not found', details: `Guide with ID ${parsedGuideId} does not exist` },
          { status: 404 }
        );
      }
    }

    const study = await prisma.study.create({
      data: {
        name: name.trim(),
        userId: user.id,
        scheduleId: parsedScheduleId,
        resourceId: parsedResourceId,
        guideId: parsedGuideId,
      },
      include: {
        schedule: true,
        resource: true,
        guide: true,
        sessions: true,
      },
    });

    console.log('Study created successfully:', study.id);
    return NextResponse.json(study, { status: 201 });
  } catch (error) {
    console.error('Error creating study:', error);

    // Handle Prisma-specific errors
    let errorMessage = 'Unknown error';
    let errorDetails: any = null;

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        message: error.message,
        ...(error.stack && { stack: error.stack }),
      };

      // Check if it's a Prisma error with additional info
      if ('code' in error) {
        errorDetails.code = (error as any).code;
      }
      if ('meta' in error) {
        errorDetails.meta = (error as any).meta;
      }
    }

    // Format error message - remove extra newlines and whitespace
    const formattedMessage = errorMessage.replace(/\n+/g, ' ').trim();

    console.error('Error details:', errorDetails || error);
    console.error('Full error message:', formattedMessage);

    return NextResponse.json(
      {
        error: 'Failed to create study',
        details: formattedMessage,
        ...(process.env.NODE_ENV === 'development' && errorDetails ? { errorDetails } : {}),
      },
      { status: 500 }
    );
  }
}
