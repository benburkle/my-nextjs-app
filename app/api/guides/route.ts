import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/get-session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if prisma is initialized correctly
    if (!prisma || !prisma.guide) {
      console.error(
        'Prisma client not initialized correctly. Available models:',
        Object.keys(prisma || {})
      );
      return NextResponse.json(
        { error: 'Database connection error', details: 'Prisma client not initialized' },
        { status: 500 }
      );
    }

    const guides = await prisma.guide.findMany({
      where: {
        userId: user.id,
      },
      include: {
        guideSteps: {
          orderBy: {
            index: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(guides);
  } catch (error) {
    console.error('Error fetching guides:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch guides',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, levelOfResource, amtOfResource } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check if prisma is initialized correctly
    if (!prisma || !prisma.guide) {
      console.error('Prisma client not initialized correctly');
      return NextResponse.json(
        { error: 'Database connection error', details: 'Prisma client not initialized' },
        { status: 500 }
      );
    }

    const guide = await prisma.guide.create({
      data: {
        name,
        userId: user.id,
        levelOfResource: levelOfResource || null,
        amtOfResource: amtOfResource || null,
      },
      include: {
        guideSteps: true,
      },
    });

    return NextResponse.json(guide, { status: 201 });
  } catch (error) {
    console.error('Error creating guide:', error);
    return NextResponse.json(
      {
        error: 'Failed to create guide',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
