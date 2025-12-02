import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get('studyId');

    const where: any = {
      userId: user.id,
    };
    if (studyId) {
      where.studyId = parseInt(studyId);
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        study: {
          include: {
            guide: {
              include: {
                guideSteps: {
                  orderBy: {
                    index: 'asc',
                  },
                },
              },
            },
          },
        },
        guideStep: true,
        selection: true,
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
      },
      orderBy: {
        date: 'desc',
      },
    });

    // For each session without steps, create them from guide steps
    for (const session of sessions) {
      if (
        session.sessionSteps.length === 0 &&
        session.study.guide &&
        session.study.guide.guideSteps.length > 0
      ) {
        await prisma.sessionStep.createMany({
          data: session.study.guide.guideSteps.map((guideStep) => ({
            sessionId: session.id,
            guideStepId: guideStep.id,
          })),
        });
      }
    }

    // Fetch sessions again to include newly created steps
    const sessionsWithSteps = await prisma.session.findMany({
      where: {
        userId: user.id,
        ...(studyId ? { studyId: parseInt(studyId) } : {}),
      },
      include: {
        study: {
          include: {
            guide: {
              include: {
                guideSteps: {
                  orderBy: {
                    index: 'asc',
                  },
                },
              },
            },
          },
        },
        guideStep: true,
        selection: true,
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
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(sessionsWithSteps);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch sessions',
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
    const { studyId, date, time, insights, reference, stepId, selectionId } = body;

    if (!studyId) {
      return NextResponse.json(
        { error: 'Study ID is required', details: 'studyId must be provided' },
        { status: 400 }
      );
    }

    // Verify study exists and belongs to user
    const study = await prisma.study.findFirst({
      where: {
        id: parseInt(studyId),
        userId: user.id,
      },
      include: {
        guide: {
          include: {
            guideSteps: {
              orderBy: {
                index: 'asc',
              },
            },
          },
        },
      },
    });

    if (!study) {
      return NextResponse.json(
        { error: 'Study not found', details: `Study with ID ${studyId} does not exist` },
        { status: 404 }
      );
    }

    // Verify stepId if provided
    if (stepId) {
      const guideStep = await prisma.guideStep.findUnique({
        where: { id: parseInt(stepId) },
      });

      if (!guideStep) {
        return NextResponse.json(
          { error: 'Guide step not found', details: `Guide step with ID ${stepId} does not exist` },
          { status: 404 }
        );
      }
    }

    // Verify selectionId if provided and belongs to user's resource
    if (selectionId) {
      const selection = await prisma.selection.findFirst({
        where: {
          id: parseInt(selectionId),
          resource: {
            userId: user.id,
          },
        },
      });

      if (!selection) {
        return NextResponse.json(
          {
            error: 'Selection not found',
            details: `Selection with ID ${selectionId} does not exist or does not belong to your resources`,
          },
          { status: 404 }
        );
      }
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        studyId: parseInt(studyId),
        date: date ? new Date(date) : null,
        time: time ? new Date(time) : null,
        insights: insights || null,
        reference: reference || null,
        stepId: stepId ? parseInt(stepId) : null,
        selectionId: selectionId ? parseInt(selectionId) : null,
      },
    });

    // If study has a guide, create session steps for all guide steps
    if (study.guide && study.guide.guideSteps.length > 0) {
      await prisma.sessionStep.createMany({
        data: study.guide.guideSteps.map((guideStep) => ({
          sessionId: session.id,
          guideStepId: guideStep.id,
        })),
      });
    }

    // Fetch the complete session with all relations
    const sessionWithSteps = await prisma.session.findUnique({
      where: { id: session.id },
      include: {
        study: true,
        guideStep: true,
        selection: true,
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
      },
    });

    return NextResponse.json(sessionWithSteps, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
