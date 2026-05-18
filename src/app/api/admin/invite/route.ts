import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import { verifyAuth } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAuth(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, email, phone } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
    }

    // Check if email already registered
    const existing = await prisma.attendee.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const qrCodeString = `invite-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const attendee = await prisma.attendee.create({
      data: { name, email, phone: phone || '', qrCode: qrCodeString },
    });

    // Log activity
    await logActivity(
      "Invited Attendee",
      `${admin.name} invited ${name} (${email}) to the summit.`,
      admin.id,
      admin.name || 'Admin'
    );

    const qrDataUrl = await QRCode.toDataURL(qrCodeString, { width: 300, margin: 2 });
    const base64Data = qrDataUrl.split(',')[1];

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        family: 4, 
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      } as any);

      const emailHtml = ` 
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden; }
        .header { background-color: #0d9488; padding: 20px; text-align: center; color: #ffffff; }
        .hero-img { width: 100%; height: auto; display: block; border-bottom: 4px solid #0f766e; }
        .content { padding: 30px; color: #374151; }
        h1 { color: #111827; font-size: 24px; margin-top: 0; }
        .details-card { background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 15px; margin: 20px 0; }
        .qr-container { text-align: center; margin: 30px 0; padding: 25px; border: 2px dashed #99f6e4; border-radius: 8px; background-color: #f9fafb; }
        .qr-code { max-width: 200px; height: auto; border-radius: 8px; }
        .footer { background-color: #1f2937; color: #9ca3af; text-align: center; padding: 20px; font-size: 12px; }
        .invite-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: bold; color: #92400e; }
      </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0; letter-spacing: 1px;">MEDWEB EVENTS</h2>
          </div>
          
          <img class="hero-img" src="https://images.unsplash.com/photo-1551076805-e18690c5e561?auto=format&fit=crop&q=80&w=800" alt="Healthcare Conference" />
          
          <div class="content">
            <div class="invite-box">
              ${admin.name} has sent you an official invitation to join us!
            </div>
            
            <h1>Hello ${name},</h1>
            <p>You have been personally invited to participate in the upcoming Global Healthcare Innovation Summit. Your registration has been pre-processed, and your official access pass is ready below.</p>
            
            <div class="details-card">
              <p style="margin: 0 0 10px 0; color: #111827;"><strong>Event:</strong> Global Healthcare Innovation Summit</p>
              <p style="margin: 0 0 10px 0; color: #111827;"><strong>Status:</strong> VIP Invited Guest</p>
              <p style="margin: 0; color: #111827;"><strong>Location:</strong> Main Convention Hall</p>
            </div>

            <div class="qr-container">
              <p style="margin-top: 0; color: #0d9488; font-weight: bold; font-size: 18px;">Your Access Pass</p>
              <img class="qr-code" src="cid:qrcode" alt="Your unique QR Code" />
              <p style="margin-bottom: 0; font-size: 14px; color: #6b7280; margin-top: 15px;">Please show this pass at the VIP desk for check-in.</p>
            </div>
            
            <p>We look forward to seeing you there!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MedWeb Healthcare Events. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
      `;

      await transporter.sendMail({
        from: '"MedWeb Events" <' + process.env.EMAIL_USER + '>',
        to: email,
        subject: `Exclusive Invitation: Healthcare Summit (Invited by ${admin.name})`,
        html: emailHtml,
        attachments: [
          {
            filename: 'invite-pass.png',
            content: base64Data,
            encoding: 'base64',
            cid: 'qrcode'
          }
        ]
      });
    }

    return NextResponse.json({ success: true, attendee });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
