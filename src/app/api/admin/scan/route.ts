import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { qrCode } = await req.json();
    if (!qrCode) return NextResponse.json({ error: 'QR Code required' }, { status: 400 });

    const attendee = await prisma.attendee.findUnique({ where: { qrCode } });
    if (!attendee) return NextResponse.json({ error: 'Invalid QR Code' }, { status: 404 });

    if (attendee.attended) {
      return NextResponse.json({ success: false, message: 'Already scanned!', attendee });
    }

    const updated = await prisma.attendee.update({
      where: { qrCode },
      data: { attended: true, scannedAt: new Date() },
    });

    await logActivity(
      "Check-in Success",
      `${session.name} checked in attendee: ${attendee.name}`,
      session.id,
      session.name || 'Admin'
    );

    return NextResponse.json({ success: true, message: 'Scan successful', attendee: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
