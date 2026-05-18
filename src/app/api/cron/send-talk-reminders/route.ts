import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    const now = new Date();
    // Broaden window to 30 minutes to be safer with timezones/delays
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);

    console.log(`[CRON] Checking talks. Current server time: ${now.toISOString()}`);
    console.log(`[CRON] Looking for talks starting between now and: ${thirtyMinutesFromNow.toISOString()}`);

    // Find talks that start within the next 30 minutes and haven't been notified
    const upcomingTalks = await prisma.talk.findMany({
      where: {
        notified: false,
        startTime: {
          gte: new Date(now.getTime() - 5 * 60000), // Include talks that just started (5 min grace)
          lte: thirtyMinutesFromNow,
        },
      },
    });


    if (upcomingTalks.length === 0) {
      return NextResponse.json({ message: 'No upcoming talks to notify about' });
    }

    // Fetch all attendees who have been scanned (attended)
    const attendees = await prisma.attendee.findMany({
      where: { attended: true }
    });
    if (attendees.length === 0) {
      return NextResponse.json({ message: 'No attendees to notify' });
    }

    // Setup nodemailer
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not set. Reminder emails not sent.');
      return NextResponse.json({ error: 'Email credentials not configured' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      family: 4, // Force IPv4
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    } as any);

    let totalSent = 0;

    for (const talk of upcomingTalks) {
      // Calculate dynamic time difference
      const diffMs = new Date(talk.startTime).getTime() - now.getTime();
      const diffMins = Math.round(diffMs / 60000);
      const timeText = diffMins <= 0 ? 'Starting Now!' : `Starting in ${diffMins} Minutes!`;

      // Create email HTML template
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
            <h2 style="margin: 0; letter-spacing: 1px;">MEDWEB EVENTS - UPCOMING TALK</h2>
          </div>
          ${posterImageHtml}
          <div class="content">
            <h1>${timeText}</h1>
            <p>Don't miss our upcoming session. Head over to the hall to secure your seat.</p>
            
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

      // Send to all attendees
      // Note: for a huge list, you should use Bcc or send in batches. We'll loop for simplicity in this demo.
      const bccList = attendees.map(a => a.email).join(', ');

      await transporter.sendMail({
        from: '"MedWeb Schedule" <' + process.env.EMAIL_USER + '>',
        to: process.env.EMAIL_USER, // Send to self, BCC everyone else for privacy
        bcc: bccList,
        subject: `Upcoming Talk: ${talk.title}`,
        html: emailHtml,
        attachments: attachments,
      });

      totalSent += attendees.length;

      // Mark as notified
      await prisma.talk.update({
        where: { id: talk.id },
        data: { notified: true },
      });
    }

    return NextResponse.json({ success: true, message: `Sent ${totalSent} emails for ${upcomingTalks.length} talks.` });
  } catch (error: any) {
    console.error('Failed to send reminders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
