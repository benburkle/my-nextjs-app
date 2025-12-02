import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId');

    const where = resourceId ? { resourceId: parseInt(resourceId) } : {};

    const chapters = await prisma.chapter.findMany({
      where,
      orderBy: { number: 'asc' },
    });
    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch chapters',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resourceId, number, name } = body;

    if (!resourceId || !number) {
      return NextResponse.json({ error: 'resourceId and number are required' }, { status: 400 });
    }

    const chapter = await prisma.chapter.create({
      data: {
        resourceId: parseInt(resourceId),
        number: parseInt(number),
        name: name || null,
      },
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json(
      {
        error: 'Failed to create chapter',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
