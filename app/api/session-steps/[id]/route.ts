import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { insights } = body;

    const sessionStep = await prisma.sessionStep.update({
      where: { id: parseInt(id) },
      data: {
        insights: insights || null,
      },
      include: {
        guideStep: true,
        session: true,
      },
    });

    return NextResponse.json(sessionStep);
  } catch (error) {
    console.error('Error updating session step:', error);
    return NextResponse.json(
      {
        error: 'Failed to update session step',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
