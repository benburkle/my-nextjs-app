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
    const guideStep = await prisma.guideStep.findUnique({
      where: { id: parseInt(id) },
      include: {
        guide: true,
      },
    });

    if (!guideStep) {
      return NextResponse.json({ error: 'Guide step not found' }, { status: 404 });
    }

    // Verify guide belongs to user
    if (guideStep.guide.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(guideStep);
  } catch (error) {
    console.error('Error fetching guide step:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch guide step',
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
    const { name, shortDescription, instructions, example, amtOfResourcePerStep } = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    // Verify guide step belongs to user
    const existingStep = await prisma.guideStep.findUnique({
      where: { id: parseInt(id) },
      include: {
        guide: true,
      },
    });

    if (!existingStep) {
      return NextResponse.json({ error: 'Guide step not found' }, { status: 404 });
    }

    if (!existingStep.guide) {
      return NextResponse.json({ error: 'Guide not found for this step' }, { status: 404 });
    }

    if (existingStep.guide.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updateData: {
      name: string;
      shortDescription?: string | null;
      instructions?: string | null;
      example?: string | null;
      amtOfResourcePerStep?: string | null;
    } = {
      name,
    };

    if (shortDescription !== undefined) {
      updateData.shortDescription = shortDescription || null;
    }
    if (instructions !== undefined) {
      updateData.instructions = instructions || null;
    }
    if (example !== undefined) {
      updateData.example = example || null;
    }
    if (amtOfResourcePerStep !== undefined) {
      updateData.amtOfResourcePerStep = amtOfResourcePerStep || null;
    }

    const guideStep = await prisma.guideStep.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json(guideStep);
  } catch (error) {
    console.error('Error updating guide step:', error);
    const errorDetails = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorDetails);
    return NextResponse.json(
      {
        error: 'Failed to update guide step',
        details: errorDetails,
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

    // Verify guide step belongs to user
    const existingStep = await prisma.guideStep.findUnique({
      where: { id: parseInt(id) },
      include: {
        guide: true,
      },
    });

    if (!existingStep) {
      return NextResponse.json({ error: 'Guide step not found' }, { status: 404 });
    }

    if (existingStep.guide.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.guideStep.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guide step:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete guide step',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
