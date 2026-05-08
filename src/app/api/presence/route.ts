import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'Guest';
    
    let ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'Unknown';
    if (ip === '::1') ip = '127.0.0.1';

    const publicDir = path.join(process.cwd(), 'public');
    const downloadsDir = path.join(publicDir, 'downloads');
    const presencePath = path.join(downloadsDir, 'presence.json');

    await mkdir(downloadsDir, { recursive: true });

    let presenceData: Record<string, { ip: string, lastSeen: string }> = {};
    try {
      const content = await readFile(presencePath, 'utf-8');
      presenceData = JSON.parse(content);
    } catch (e) {}

    // Actualizar o añadir usuario
    presenceData[username] = {
      ip,
      lastSeen: new Date().toISOString()
    };

    // Opcional: Limpiar usuarios inactivos (más de 1 minuto)
    const now = new Date().getTime();
    const cleanData: Record<string, any> = {};
    for (const user in presenceData) {
      if (now - new Date(presenceData[user].lastSeen).getTime() < 60000) {
        cleanData[user] = presenceData[user];
      }
    }

    await writeFile(presencePath, JSON.stringify(cleanData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error recording presence' }, { status: 500 });
  }
}
