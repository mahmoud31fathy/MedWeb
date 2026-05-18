import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function GET() {
  try {
    const talks = await prisma.talk.findMany({
      orderBy: { startTime: 'asc' },
    });
    return NextResponse.json(talks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, speaker, location, startTime, imageUrl } = await req.json();

    if (!title || !speaker || !location || !startTime) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const talk = await prisma.talk.create({
      data: {
        title,
        speaker,
        location,
        startTime: new Date(startTime),
        imageUrl: imageUrl || null,
      },
    });

    await logActivity(
      "Added Talk",
      `${session.name} added talk: ${title} by ${speaker}`,
      session.id,
      session.name || 'Admin'
    );

    return NextResponse.json({ success: true, talk });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const talk = await prisma.talk.findUnique({ where: { id } });
    if (!talk) return NextResponse.json({ error: 'Talk not found' }, { status: 404 });

    await prisma.talk.delete({ where: { id } });

    await logActivity(
      "Deleted Talk",
      `${session.name} removed talk: ${talk.title}`,
      session.id,
      session.name || 'Admin'
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
