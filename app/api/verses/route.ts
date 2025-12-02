import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Check if prisma is initialized correctly
    if (!prisma || !prisma.verse) {
      console.error(
        'Prisma client not initialized correctly. Available models:',
        Object.keys(prisma || {})
      );
      return NextResponse.json(
        { error: 'Database connection error', details: 'Prisma client not initialized' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    const where = chapterId ? { chapterId: parseInt(chapterId) } : {};

    console.log('Fetching verses with where clause:', where);

    const verses = await prisma.verse.findMany({
      where,
      orderBy: { number: 'asc' },
    });

    console.log(`Found ${verses.length} verses`);
    return NextResponse.json(verses);
  } catch (error) {
    console.error('Error fetching verses:', error);
    const errorDetails =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : { error: 'Unknown error' };

    return NextResponse.json(
      {
        error: 'Failed to fetch verses',
        details: error instanceof Error ? error.message : 'Unknown error',
        ...(process.env.NODE_ENV === 'development' && errorDetails ? { errorDetails } : {}),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chapterId, number, text } = body;
    if (!chapterId || !number)
      return NextResponse.json({ error: 'chapterId and number are required' }, { status: 400 });

    const verse = await prisma.verse.create({
      data: {
        chapterId: parseInt(chapterId),
        number: parseInt(number),
        text: text || null,
      },
    });
    return NextResponse.json(verse, { status: 201 });
  } catch (error: any) {
    console.error('Error creating verse:', error);
    // Handle unique constraint violation
    if (error.code === 'P2002' || error.message?.includes('Unique constraint')) {
      return NextResponse.json(
        {
          error: 'A verse with this number already exists in this chapter',
          details: 'Verses must be unique per chapter',
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        error: 'Failed to create verse',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
