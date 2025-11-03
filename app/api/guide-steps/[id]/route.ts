import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const guideStep = await prisma.guideStep.findUnique({
      where: { id: parseInt(id) },
    });

    if (!guideStep) {
      return NextResponse.json(
        { error: 'Guide step not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(guideStep);
  } catch (error) {
    console.error('Error fetching guide step:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guide step', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { index, name, instructions, example, amtOfResourcePerStep } = body;

    if (index === undefined || !name) {
      return NextResponse.json(
        { error: 'index and name are required' },
        { status: 400 }
      );
    }

    const guideStep = await prisma.guideStep.update({
      where: { id: parseInt(id) },
      data: {
        index: parseInt(index),
        name,
        instructions: instructions || null,
        example: example || null,
        amtOfResourcePerStep: amtOfResourcePerStep || null,
      },
    });

    return NextResponse.json(guideStep);
  } catch (error) {
    console.error('Error updating guide step:', error);
    return NextResponse.json(
      { error: 'Failed to update guide step', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.guideStep.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guide step:', error);
    return NextResponse.json(
      { error: 'Failed to delete guide step', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
