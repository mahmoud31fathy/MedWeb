import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const totalRegistered = await prisma.attendee.count();
    const totalAttended = await prisma.attendee.count({ where: { attended: true } });
    const notAttended = totalRegistered - totalAttended;

    const attendees = await prisma.attendee.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      totalRegistered,
      totalAttended,
      notAttended,
      attendees,
      role: session.role
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
