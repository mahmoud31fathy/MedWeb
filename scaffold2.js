const fs = require('fs');
const path = require('path');

const files = {
  'src/app/api/register/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone } = await req.json();

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Check if email already registered
    const existing = await prisma.attendee.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Generate unique QR code string
    const qrCodeString = \`event-\${Date.now()}-\${Math.random().toString(36).substring(2, 9)}\`;

    const attendee = await prisma.attendee.create({
      data: { name, email, phone, qrCode: qrCodeString },
    });

    // Generate QR Code image (Data URI)
    const qrImage = await QRCode.toDataURL(qrCodeString);

    // Send email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Change if not gmail
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: \`"Event Registration" <\${process.env.EMAIL_USER}>\`,
        to: email,
        subject: 'Your Event Ticket (QR Code)',
        html: \`
          <h1>Hello \${name},</h1>
          <p>Thank you for registering for the event. Your ticket is attached below.</p>
          <p>Please present this QR code at the entrance.</p>
          <img src="\${qrImage}" alt="QR Code" />
        \`,
      });
    } else {
      console.warn('Email credentials not set. Email not sent.');
    }

    return NextResponse.json({ success: true, attendee });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`,
  'src/app/api/admin/login/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Create session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ id: admin.id, email: admin.email, role: admin.role, expires });
    
    const cookieStore = await cookies();
    cookieStore.set('session', session, { expires, httpOnly: true });
    
    return NextResponse.json({ success: true, role: admin.role });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`,
  'src/app/api/admin/logout/route.ts': `import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return NextResponse.json({ success: true });
}
`,
  'src/app/api/admin/scan/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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

    return NextResponse.json({ success: true, message: 'Scan successful', attendee: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`,
  'src/app/api/admin/stats/route.ts': `import { NextRequest, NextResponse } from 'next/server';
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
`,
  'src/app/api/admin/subadmins/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { email, name, password, role } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await prisma.admin.create({
      data: { email, name, password: hashedPassword, role: role || 'SUBADMIN' }
    });

    return NextResponse.json({ success: true, admin: { id: admin.id, email: admin.email } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.admin.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Scaffold 2 complete.');
