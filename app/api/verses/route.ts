import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    const where = chapterId ? { chapterId: parseInt(chapterId) } : {};

    const verses = await prisma.verse.findMany({
      where,
      orderBy: { number: 'asc' },
    });
    return NextResponse.json(verses);
  } catch (error) {
    console.error('Error fetching verses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verses', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chapterId, number } = body;
    if (!chapterId || !number) return NextResponse.json({ error: 'chapterId and number are required' }, { status: 400 });

    const verse = await prisma.verse.create({
      data: {
        chapterId: parseInt(chapterId),
        number: parseInt(number),
      },
    });
    return NextResponse.json(verse, { status: 201 });
  } catch (error) {
    console.error('Error creating verse:', error);
    return NextResponse.json({ error: 'Failed to create verse' }, { status: 500 });
  }
}
