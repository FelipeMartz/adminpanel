import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'Guest';
    const hwid = searchParams.get('hwid') || 'Unknown';
    const version = searchParams.get('version') || 'Unknown';
    
    let ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'Unknown';
    if (ip === '::1') ip = '127.0.0.1';

    const publicDir = path.join(process.cwd(), 'public');
    const downloadsDir = path.join(publicDir, 'downloads');
    const presencePath = path.join(downloadsDir, 'presence.json');

    await mkdir(downloadsDir, { recursive: true });

    let presenceData: Record<string, any> = {};
    try {
      const content = await readFile(presencePath, 'utf-8');
      presenceData = JSON.parse(content);
    } catch (e) {}

    // Actualizar o añadir usuario
    presenceData[username] = {
      ip,
      hwid,
      version,
      lastSeen: new Date().toISOString()
    };

    // Limpiar usuarios inactivos (12 segundos para dar margen al latido de 10s)
    const now = new Date().getTime();
    const cleanData: Record<string, any> = {};
    for (const user in presenceData) {
      const lastSeenTime = new Date(presenceData[user].lastSeen).getTime();
      const diff = now - lastSeenTime;
      if (diff < 12000) { 
        cleanData[user] = presenceData[user];
      }
    }

    console.log(`Writing presence for ${username}. Total online: ${Object.keys(cleanData).length}`);
    await writeFile(presencePath, JSON.stringify(cleanData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error recording presence' }, { status: 500 });
  }
}
