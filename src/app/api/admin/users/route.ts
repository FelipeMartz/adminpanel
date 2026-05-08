import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
    const presencePath = path.join(downloadsDir, 'presence.json');
    const logsPath = path.join(downloadsDir, 'logs.json');
    const bannedPath = path.join(downloadsDir, 'banned_ips.json');
    const aliasesPath = path.join(downloadsDir, 'aliases.json');

    // Leer datos
    const [presenceRes, logsRes, bannedRes, aliasesRes] = await Promise.all([
      readFile(presencePath, 'utf-8').then(JSON.parse).catch(() => ({})),
      readFile(logsPath, 'utf-8').then(JSON.parse).catch(() => []),
      readFile(bannedPath, 'utf-8').then(JSON.parse).catch(() => []),
      readFile(aliasesPath, 'utf-8').then(JSON.parse).catch(() => ({})),
    ]);

    // Limpiar presencia inactiva (12s)
    const now = new Date().getTime();
    const cleanPresence: any = {};
    for (const u in presenceRes) {
      if (now - new Date(presenceRes[u].lastSeen).getTime() < 12000) {
        cleanPresence[u] = presenceRes[u];
      }
    }
    const filteredPresenceRes = cleanPresence;

    // Combinar usuarios únicos de presencia y logs
    const allUsernames = new Set([
      ...Object.keys(filteredPresenceRes),
      ...logsRes.map((log: any) => log.username).filter(Boolean)
    ]);

    const users = Array.from(allUsernames).map(username => {
      const presence = filteredPresenceRes[username];
      const userLogs = logsRes.filter((l: any) => l.username === username);
      const lastLog = userLogs[0];

      return {
        username: aliasesRes[username] || username,
        originalUsername: username,
        online: !!presence,
        ip: presence?.ip || lastLog?.ip || 'Unknown',
        lastSeen: presence?.lastSeen || lastLog?.timestamp || 'N/A',
        hwid: presence?.hwid || lastLog?.hwid || 'N/A',
        version: presence?.version || lastLog?.version_checked || 'N/A',
        banned: bannedRes.some((b: any) => b.ip === (presence?.ip || lastLog?.ip))
      };
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error loading custom users' }, { status: 500 });
  }
}
