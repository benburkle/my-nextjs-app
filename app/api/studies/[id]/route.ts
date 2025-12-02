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
    let study = await prisma.study.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
      include: {
        schedule: true,
        resource: true,
        guide: {
          include: {
            guideSteps: {
              orderBy: {
                index: 'asc',
              },
            },
          },
        },
        sessions: {
          orderBy: {
            date: 'desc',
          },
          include: {
            sessionSteps: {
              include: {
                guideStep: true,
              },
              orderBy: {
                guideStep: {
                  index: 'asc',
                },
              },
            },
            guideStep: true,
            selection: true,
          },
        },
      },
    });

    if (!study) {
      return NextResponse.json({ error: 'Study not found' }, { status: 404 });
    }

    // For each session without steps, create them from guide steps
    if (study.guide && study.guide.guideSteps.length > 0) {
      for (const session of study.sessions) {
        if (session.sessionSteps.length === 0) {
          await prisma.sessionStep.createMany({
            data: study.guide.guideSteps.map((guideStep) => ({
              sessionId: session.id,
              guideStepId: guideStep.id,
            })),
          });
        }
      }
    }

    // Fetch the study again to include newly created session steps
    study = await prisma.study.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
      include: {
        schedule: true,
        resource: true,
        guide: {
          include: {
            guideSteps: {
              orderBy: {
                index: 'asc',
              },
            },
          },
        },
        sessions: {
          orderBy: {
            date: 'desc',
          },
          include: {
            sessionSteps: {
              include: {
                guideStep: true,
              },
              orderBy: {
                guideStep: {
                  index: 'asc',
                },
              },
            },
            guideStep: true,
            selection: true,
          },
        },
      },
    });

    return NextResponse.json(study);
  } catch (error) {
    console.error('Error fetching study:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch study',
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
    const { name, scheduleId, resourceId, guideId } = body;

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

    // Verify study belongs to user before updating
    const existingStudy = await prisma.study.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!existingStudy) {
      return NextResponse.json({ error: 'Study not found' }, { status: 404 });
    }

    const study = await prisma.study.update({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
      data: {
        name: name.trim(),
        scheduleId: parsedScheduleId,
        resourceId: parsedResourceId,
        guideId: parsedGuideId,
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
      {
        error: 'Failed to update study',
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

    // Verify study belongs to user before deleting
    const study = await prisma.study.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!study) {
      return NextResponse.json({ error: 'Study not found' }, { status: 404 });
    }

    await prisma.study.delete({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting study:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete study',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
