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
    const guide = await prisma.guide.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
      include: {
        guideSteps: {
          orderBy: {
            index: 'asc',
          },
        },
      },
    });

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    return NextResponse.json(guide);
  } catch (error) {
    console.error('Error fetching guide:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch guide',
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
    const { name, levelOfResource, amtOfResource } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Verify guide belongs to user
    const existingGuide = await prisma.guide.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!existingGuide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    const guide = await prisma.guide.update({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
      data: {
        name,
        levelOfResource: levelOfResource || null,
        amtOfResource: amtOfResource || null,
      },
      include: {
        guideSteps: {
          orderBy: {
            index: 'asc',
          },
        },
      },
    });

    return NextResponse.json(guide);
  } catch (error) {
    console.error('Error updating guide:', error);
    return NextResponse.json(
      {
        error: 'Failed to update guide',
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

    // Verify guide belongs to user
    const guide = await prisma.guide.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    await prisma.guide.delete({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guide:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete guide',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
