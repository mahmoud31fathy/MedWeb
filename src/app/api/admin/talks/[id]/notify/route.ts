import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Fetch the talk
    const talk = await prisma.talk.findUnique({
      where: { id },
    });

    if (!talk) {
      return NextResponse.json({ error: 'Talk not found' }, { status: 404 });
    }

    // 2. Fetch all attendees who have been scanned (attended)
    const attendees = await prisma.attendee.findMany({
      where: { attended: true }
    });
    if (attendees.length === 0) {
      return NextResponse.json({ message: 'No attendees to notify' });
    }

    // 3. Setup nodemailer
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json({ error: 'Email credentials not configured' }, { status: 500 });
    }

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

    // 4. Prepare Email Template
    const now = new Date();
    const diffMs = new Date(talk.startTime).getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const timeText = diffMins <= 0 ? 'Starting Now!' : `Starting in ${diffMins} Minutes!`;

    let attachments: any[] = [];
    let posterImageHtml = '';

    if (talk.imageUrl) {
      if (talk.imageUrl.startsWith('data:image/')) {
        const matches = talk.imageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          attachments.push({
            filename: 'poster.jpg',
            content: matches[2],
            encoding: 'base64',
            cid: 'talk-poster'
          });
          posterImageHtml = `<img src="cid:talk-poster" alt="Talk Poster" style="width: 100%; height: auto; display: block; border-bottom: 4px solid #0f766e;" />`;
        } else {
          posterImageHtml = `<img src="${talk.imageUrl}" alt="Talk Poster" style="width: 100%; height: auto; display: block; border-bottom: 4px solid #0f766e;" />`;
        }
      } else {
        posterImageHtml = `<img src="${talk.imageUrl}" alt="Talk Poster" style="width: 100%; height: auto; display: block; border-bottom: 4px solid #0f766e;" />`;
      }
    }

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden; }
      .header { background-color: #0d9488; padding: 20px; text-align: center; color: #ffffff; }
      .content { padding: 30px; color: #374151; }
      h1 { color: #111827; font-size: 24px; margin-top: 0; }
      .details-card { background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 15px; margin: 20px 0; }
      .footer { background-color: #1f2937; color: #9ca3af; text-align: center; padding: 20px; font-size: 12px; }
    </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0; letter-spacing: 1px;">MEDWEB EVENTS - TALK REMINDER</h2>
        </div>
        ${posterImageHtml}
        <div class="content">
          <h1>${timeText}</h1>
          <p>This is a reminder for our upcoming session. We hope to see you there!</p>
          
          <div class="details-card">
            <p style="margin: 0 0 10px 0; color: #111827;"><strong>Topic:</strong> ${talk.title}</p>
            <p style="margin: 0 0 10px 0; color: #111827;"><strong>Speaker:</strong> ${talk.speaker}</p>
            <p style="margin: 0 0 10px 0; color: #111827;"><strong>Location:</strong> ${talk.location}</p>
            <p style="margin: 0; color: #111827;"><strong>Time:</strong> ${new Date(talk.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} MedWeb Healthcare Events.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const bccList = attendees.map(a => a.email).join(', ');

    await transporter.sendMail({
      from: '"MedWeb Schedule" <' + process.env.EMAIL_USER + '>',
      to: process.env.EMAIL_USER,
      bcc: bccList,
      subject: `Reminder: ${talk.title}`,
      html: emailHtml,
      attachments: attachments,
    });

    // 5. Update notified status
    await prisma.talk.update({
      where: { id },
      data: { notified: true },
    });

    return NextResponse.json({ success: true, message: `Sent ${attendees.length} emails.` });
  } catch (error: any) {
    console.error('Failed to send manual reminder:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
