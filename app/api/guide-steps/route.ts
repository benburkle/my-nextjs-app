import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guideId, index, name, instructions, example, amtOfResourcePerStep } = body;

    if (!guideId || index === undefined || !name) {
      return NextResponse.json(
        { error: 'guideId, index, and name are required' },
        { status: 400 }
      );
    }

    const guideStep = await prisma.guideStep.create({
      data: {
        guideId: parseInt(guideId),
        index: parseInt(index),
        name,
        instructions: instructions || null,
        example: example || null,
        amtOfResourcePerStep: amtOfResourcePerStep || null,
      },
    });

    return NextResponse.json(guideStep, { status: 201 });
  } catch (error) {
    console.error('Error creating guide step:', error);
    return NextResponse.json(
      { error: 'Failed to create guide step', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
