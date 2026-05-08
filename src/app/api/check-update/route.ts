import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // 1. Obtener la IP del usuario
    let ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'Unknown';

    if (ip === '::1') ip = '127.0.0.1';

    const publicDir = path.join(process.cwd(), 'public');
    const downloadsDir = path.join(publicDir, 'downloads');
    const bannedPath = path.join(downloadsDir, 'banned_ips.json');

    // 1.5 Verificar si la IP está baneada
    try {
      const bannedContent = await readFile(bannedPath, 'utf-8');
      const bannedData = JSON.parse(bannedContent);
      const banInfo = bannedData.find((item: any) => item.ip === ip);
      
      if (banInfo) {
        return NextResponse.json({ 
          banned: true, 
          message: `Tu acceso ha sido denegado. Razón: ${banInfo.reason}` 
        }, { status: 403 });
      }
    } catch (e) {}
    const versionPath = path.join(downloadsDir, 'version.json');
    const logsPath = path.join(downloadsDir, 'logs.json');

    // 2. Leer la versión actual
    let versionData = { version: '0.0.0', url: '', timestamp: '' };
    try {
      const content = await readFile(versionPath, 'utf-8');
      versionData = JSON.parse(content);
    } catch (e) {
      // Si no existe, devolvemos valores por defecto
    }

    // 3. Registrar el log del usuario (IP + Timestamp)
    let logs = [];
    try {
      await mkdir(downloadsDir, { recursive: true });
      const logsContent = await readFile(logsPath, 'utf-8');
      logs = JSON.parse(logsContent);
    } catch (e) {
      // Primer log
    }

    const newLog = {
      ip,
      version_checked: versionData.version,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'Unknown'
    };

    logs.unshift(newLog);
    
    // Mantener solo los últimos 50 logs
    if (logs.length > 50) logs = logs.slice(0, 50);

    await writeFile(logsPath, JSON.stringify(logs, null, 2));

    // 4. Responder a la aplicación
    return NextResponse.json(versionData);
  } catch (error) {
    console.error('Error in check-update:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
