import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    let { ip, action, reason } = await request.json();
    if (!ip) return NextResponse.json({ error: 'IP requerida' }, { status: 400 });

    if (ip === '::1') ip = '127.0.0.1';

    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
    const bannedPath = path.join(downloadsDir, 'banned_ips.json');

    await mkdir(downloadsDir, { recursive: true });

    let bannedData = [];
    try {
      const content = await readFile(bannedPath, 'utf-8');
      bannedData = JSON.parse(content);
    } catch (e) {}

    if (action === 'ban') {
      // Remover si ya existe para actualizar la razón
      bannedData = bannedData.filter((item: any) => item.ip !== ip);
      bannedData.push({ 
        ip, 
        reason: reason || 'Incumplimiento de términos', 
        timestamp: new Date().toISOString() 
      });
    } else if (action === 'unban') {
      bannedData = bannedData.filter((item: any) => item.ip !== ip);
    }

    await writeFile(bannedPath, JSON.stringify(bannedData, null, 2));

    return NextResponse.json({ success: true, bannedData });
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar baneo' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const bannedPath = path.join(process.cwd(), 'public', 'downloads', 'banned_ips.json');
    const content = await readFile(bannedPath, 'utf-8');
    return NextResponse.json(JSON.parse(content));
  } catch (e) {
    return NextResponse.json([]);
  }
}
