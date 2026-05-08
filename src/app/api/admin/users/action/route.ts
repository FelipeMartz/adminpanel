import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { username, originalUsername, action, value } = await request.json();
    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
    await mkdir(downloadsDir, { recursive: true });

    if (action === 'rename') {
      const aliasesPath = path.join(downloadsDir, 'aliases.json');
      let aliases: Record<string, string> = {};
      try {
        const content = await readFile(aliasesPath, 'utf-8');
        aliases = JSON.parse(content);
      } catch (e) {}

      aliases[originalUsername || username] = value;
      await writeFile(aliasesPath, JSON.stringify(aliases, null, 2));
      return NextResponse.json({ success: true, message: 'User renamed' });
    }

    if (action === 'ban') {
      const { ip, reason } = await request.json().catch(() => ({})); // Handle if ip is passed separately
      const bannedPath = path.join(downloadsDir, 'banned_ips.json');
      let bannedData = [];
      try {
        const content = await readFile(bannedPath, 'utf-8');
        bannedData = JSON.parse(content);
      } catch (e) {}

      // Add to banned list
      bannedData = bannedData.filter((item: any) => item.ip !== value);
      bannedData.push({ 
        ip: value, // In this case 'value' is the IP
        reason: 'Banned from admin panel',
        timestamp: new Date().toISOString() 
      });

      await writeFile(bannedPath, JSON.stringify(bannedData, null, 2));
      return NextResponse.json({ success: true, message: 'IP Banned' });
    }

    return NextResponse.json({ success: false, message: 'Action not supported yet' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
