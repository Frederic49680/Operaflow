import { NextResponse } from 'next/server';
import sg from '@sendgrid/mail';

sg.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  try {
    const { to, subject, html, text } = await req.json();
    
    await sg.send({
      to,
      from: process.env.SENDGRID_FROM!, // = Single Sender
      subject,
      text: text || '',
      html: html || '<p>(vide)</p>',
    });
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erreur SendGrid:', error);
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 });
  }
}
