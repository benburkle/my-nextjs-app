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
    let session = await prisma.session.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
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
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // If no session steps exist and study has a guide, create them
    if (
      session.sessionSteps.length === 0 &&
      session.study.guide &&
      session.study.guide.guideSteps.length > 0
    ) {
      await prisma.sessionStep.createMany({
        data: session.study.guide.guideSteps.map((guideStep) => ({
          sessionId: session!.id,
          guideStepId: guideStep.id,
        })),
      });

      // Fetch the session again with the newly created steps
      const updatedSession = await prisma.session.findFirst({
        where: {
          id: parseInt(id),
          userId: user.id,
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
      });

      if (!updatedSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      session = updatedSession;
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch session',
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
    const { date, time, insights, reference, stepId, selectionId } = body;

    // Verify session belongs to user
    const existingSession = await prisma.session.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
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

    const updateData: any = {};
    if (date !== undefined) updateData.date = date ? new Date(date) : null;
    if (time !== undefined) updateData.time = time ? new Date(time) : null;
    if (insights !== undefined) updateData.insights = insights || null;
    if (reference !== undefined) updateData.reference = reference || null;
    if (stepId !== undefined) updateData.stepId = stepId ? parseInt(stepId) : null;
    if (selectionId !== undefined)
      updateData.selectionId = selectionId ? parseInt(selectionId) : null;

    let session = await prisma.session.update({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
      data: updateData,
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
    });

    // If no session steps exist and study has a guide, create them
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

      // Fetch the session again with the newly created steps
      const updatedSession = await prisma.session.findFirst({
        where: {
          id: parseInt(id),
          userId: user.id,
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
      });

      if (!updatedSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      session = updatedSession;
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      {
        error: 'Failed to update session',
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

    // Verify session belongs to user
    const session = await prisma.session.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await prisma.session.delete({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
