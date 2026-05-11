import { NextRequest, NextResponse } from 'next/server';
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
    const qrCodeString = `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const attendee = await prisma.attendee.create({
      data: { name, email, phone, qrCode: qrCodeString },
    });

    // Generate QR Code image as a Data URI with larger size and less margin
    const qrDataUrl = await QRCode.toDataURL(qrCodeString, { width: 300, margin: 2 });
    const base64Data = qrDataUrl.split(',')[1]; // Extract just the base64 part

    // Send email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Change if not gmail
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

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
      </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0; letter-spacing: 1px;">MEDWEB EVENTS</h2>
          </div>
          
          <!-- Medical Theme Hero Image -->
          <img class="hero-img" src="https://images.unsplash.com/photo-1551076805-e18690c5e561?auto=format&fit=crop&q=80&w=800" alt="Healthcare Conference" />
          
          <div class="content">
            <h1>Hello ${name},</h1>
            <p>Thank you for registering. Your spot is confirmed and your electronic ticket is securely attached below.</p>
            
            <div class="details-card">
              <p style="margin: 0 0 10px 0; color: #111827;"><strong>Event:</strong> Global Healthcare Innovation Summit</p>
              <p style="margin: 0 0 10px 0; color: #111827;"><strong>Date & Time:</strong> Upcoming (See Schedule)</p>
              <p style="margin: 0; color: #111827;"><strong>Location:</strong> Main Convention Hall</p>
            </div>

            <div class="qr-container">
              <p style="margin-top: 0; color: #0d9488; font-weight: bold; font-size: 18px;">Your Access Pass</p>
              <!-- The src uses the CID to properly embed the image instead of a raw base64 string -->
              <img class="qr-code" src="cid:qrcode" alt="Your unique QR Code" />
              <p style="margin-bottom: 0; font-size: 14px; color: #6b7280; margin-top: 15px;">Please present this QR code at the entrance for expedited check-in.</p>
            </div>
            
            <p>If you have any questions, feel free to contact our support desk.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MedWeb Healthcare Events. All rights reserved.</p>
            <p style="color: #6b7280;">Powering Innovation in Modern Medicine.</p>
          </div>
        </div>
      </body>
      </html>
      `;

      await transporter.sendMail({
        from: '"MedWeb Registration" <' + process.env.EMAIL_USER + '>',
        to: email,
        subject: 'Confirmed: Your Healthcare Summit Ticket',
        html: emailHtml,
        attachments: [
          {
            filename: 'ticket-qrcode.png',
            content: base64Data,
            encoding: 'base64',
            cid: 'qrcode' // This allows the image to be embedded cleanly in Gmail/Outlook
          }
        ]
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
