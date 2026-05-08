import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { title, description, color } = await request.json();
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json({ success: false, message: 'Webhook no configurado' }, { status: 500 });
    }

    const embed = {
      title: title || 'Anuncio del Sistema',
      description: description,
      color: color ? parseInt(color.replace('#', ''), 16) : 0x000000,
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Admin Panel',
      },
    };

    await axios.post(webhookUrl, {
      embeds: [embed],
    });

    return NextResponse.json({ success: true, message: 'Anuncio enviado a Discord' });
  } catch (error: any) {
    console.error('Discord Webhook Error:', error.message);
    return NextResponse.json({ success: false, message: 'Error al enviar el anuncio' }, { status: 500 });
  }
}
