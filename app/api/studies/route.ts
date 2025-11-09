import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const studies = await prisma.study.findMany({
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
      { error: 'Failed to fetch studies', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, scheduleId, resourceId, guideId } = body;

    console.log('Creating study with data:', { name, scheduleId, resourceId });

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required', details: 'Name must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required', details: 'Resource ID must be provided' },
        { status: 400 }
      );
    }

    const parsedResourceId = parseInt(resourceId);
    if (isNaN(parsedResourceId)) {
      return NextResponse.json(
        { error: 'Invalid Resource ID', details: `Resource ID must be a valid number. Received: ${resourceId}` },
        { status: 400 }
      );
    }

    // Check if resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: parsedResourceId },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found', details: `Resource with ID ${parsedResourceId} does not exist` },
        { status: 404 }
      );
    }

    // Check if schedule exists if provided
    if (scheduleId) {
      const parsedScheduleId = parseInt(scheduleId);
      if (!isNaN(parsedScheduleId)) {
        const schedule = await prisma.schedule.findUnique({
          where: { id: parsedScheduleId },
        });

        if (!schedule) {
          return NextResponse.json(
            { error: 'Schedule not found', details: `Schedule with ID ${parsedScheduleId} does not exist` },
            { status: 404 }
          );
        }
      }
    }

    // Check if guide exists if provided
    if (guideId) {
      const parsedGuideId = parseInt(guideId);
      if (!isNaN(parsedGuideId)) {
        const guide = await prisma.guide.findUnique({
          where: { id: parsedGuideId },
        });

        if (!guide) {
          return NextResponse.json(
            { error: 'Guide not found', details: `Guide with ID ${parsedGuideId} does not exist` },
            { status: 404 }
          );
        }
      }
    }

    const study = await prisma.study.create({
      data: {
        name: name.trim(),
        scheduleId: scheduleId ? parseInt(scheduleId) : null,
        resourceId: parsedResourceId,
        guideId: guideId ? parseInt(guideId) : null,
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
        ...(process.env.NODE_ENV === 'development' && errorDetails ? { errorDetails } : {})
      },
      { status: 500 }
    );
  }
}
