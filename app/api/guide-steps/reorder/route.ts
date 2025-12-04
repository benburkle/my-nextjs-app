import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { guideId, stepIds } = body;

    if (!guideId || !Array.isArray(stepIds)) {
      return NextResponse.json(
        { error: 'guideId and stepIds array are required' },
        { status: 400 }
      );
    }

    // Verify guide belongs to user
    const guide = await prisma.guide.findFirst({
      where: {
        id: parseInt(guideId),
        userId: user.id,
      },
    });

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    // Verify all steps belong to this guide
    const steps = await prisma.guideStep.findMany({
      where: {
        id: { in: stepIds },
        guideId: parseInt(guideId),
      },
    });

    if (steps.length !== stepIds.length) {
      return NextResponse.json(
        { error: 'Some steps do not belong to this guide' },
        { status: 400 }
      );
    }

    // Update indices for all steps
    const updatePromises = stepIds.map((stepId: number, index: number) =>
      prisma.guideStep.update({
        where: { id: stepId },
        data: { index: index + 1 },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering guide steps:', error);
    return NextResponse.json(
      {
        error: 'Failed to reorder guide steps',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
