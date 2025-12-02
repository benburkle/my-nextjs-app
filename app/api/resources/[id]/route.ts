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
    const resource = await prisma.resource.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
      include: {
        chapters: {
          orderBy: {
            number: 'asc',
          },
        },
        studies: true,
      },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch resource',
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
    const { name, series, type } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 });
    }

    // Verify resource belongs to user
    const existingResource = await prisma.resource.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!existingResource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const resource = await prisma.resource.update({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
      data: {
        name,
        series: series || null,
        type,
      },
      include: {
        chapters: {
          orderBy: {
            number: 'asc',
          },
        },
        studies: true,
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      {
        error: 'Failed to update resource',
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

    // Verify resource belongs to user
    const resource = await prisma.resource.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    await prisma.resource.delete({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete resource',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
