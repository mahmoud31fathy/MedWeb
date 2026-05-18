import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const admin = await verifyAuth(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
