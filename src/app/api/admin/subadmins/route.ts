import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'Super admin' && session.role !== 'SUBADMIN')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admins = await prisma.admin.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    return NextResponse.json({ admins });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'Super admin')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { email, name, password, role } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await prisma.admin.create({
      data: { email, name, password: hashedPassword, role: role || 'SUBADMIN' }
    });

    await logActivity(
      "Created Admin",
      `${session.name} created new ${role || 'SUBADMIN'}: ${name} (${email})`,
      session.id,
      session.name || 'Admin'
    );

    return NextResponse.json({ success: true, admin: { id: admin.id, email: admin.email } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'Super admin')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const targetAdmin = await prisma.admin.findUnique({ where: { id } });
    if (!targetAdmin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

    await prisma.admin.delete({ where: { id } });

    await logActivity(
      "Deleted Admin",
      `${session.name} removed administrator: ${targetAdmin.name} (${targetAdmin.email})`,
      session.id,
      session.name || 'Admin'
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
