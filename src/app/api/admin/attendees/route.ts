import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const attendee = await prisma.attendee.findUnique({ where: { id } });
    if (!attendee) return NextResponse.json({ error: 'Attendee not found' }, { status: 404 });

    await prisma.attendee.delete({ where: { id } });

    await logActivity(
      "Deleted Registration",
      `${session.name} removed attendee registration for ${attendee.name} (${attendee.email})`,
      session.id,
      session.name || 'Admin'
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
