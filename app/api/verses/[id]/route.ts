import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const verse = await prisma.verse.findUnique({ where: { id: parseInt(id) } });
    if (!verse) return NextResponse.json({ error: 'Verse not found' }, { status: 404 });
    return NextResponse.json(verse);
  } catch (error) {
    console.error('Error fetching verse:', error);
    return NextResponse.json({ error: 'Failed to fetch verse' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { number, text } = body;
    if (number === undefined)
      return NextResponse.json({ error: 'number is required' }, { status: 400 });

    const updateData: { number: number; text?: string | null } = { number: parseInt(number) };
    if (text !== undefined) {
      updateData.text = text || null;
    }

    const verse = await prisma.verse.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
    return NextResponse.json(verse);
  } catch (error: any) {
    console.error('Error updating verse:', error);
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
        error: 'Failed to update verse',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.verse.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting verse:', error);
    return NextResponse.json({ error: 'Failed to delete verse' }, { status: 500 });
  }
}
