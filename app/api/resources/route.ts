import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        chapters: {
          orderBy: {
            number: 'asc',
          },
        },
        studies: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, series, type } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        series: series || null,
        type,
      },
      include: {
        chapters: true,
        studies: true,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
