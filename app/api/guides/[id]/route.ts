import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const guide = await prisma.guide.findUnique({
      where: { id: parseInt(id) },
      include: {
        guideSteps: {
          orderBy: {
            index: 'asc',
          },
        },
      },
    });

    if (!guide) {
      return NextResponse.json(
        { error: 'Guide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(guide);
  } catch (error) {
    console.error('Error fetching guide:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guide', details: error instanceof Error ? error.message : 'Unknown error' },
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
    const { name, levelOfResource, amtOfResource } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const guide = await prisma.guide.update({
      where: { id: parseInt(id) },
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
      { error: 'Failed to update guide', details: error instanceof Error ? error.message : 'Unknown error' },
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
    await prisma.guide.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guide:', error);
    return NextResponse.json(
      { error: 'Failed to delete guide', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
