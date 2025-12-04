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
    const { guideId, name, shortDescription, instructions, example, amtOfResourcePerStep } = body;

    if (!guideId || !name) {
      return NextResponse.json({ error: 'guideId and name are required' }, { status: 400 });
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

    // Get the maximum index for this guide and add 1
    const maxStep = await prisma.guideStep.findFirst({
      where: { guideId: parseInt(guideId) },
      orderBy: { index: 'desc' },
    });

    const nextIndex = maxStep ? maxStep.index + 1 : 1;

    const guideStep = await prisma.guideStep.create({
      data: {
        guideId: parseInt(guideId),
        index: nextIndex,
        name,
        shortDescription: shortDescription || null,
        instructions: instructions || null,
        example: example || null,
        amtOfResourcePerStep: amtOfResourcePerStep || null,
      },
    });

    return NextResponse.json(guideStep, { status: 201 });
  } catch (error) {
    console.error('Error creating guide step:', error);
    return NextResponse.json(
      {
        error: 'Failed to create guide step',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
