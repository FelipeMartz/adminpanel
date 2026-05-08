import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const presencePath = path.join(process.cwd(), 'public', 'downloads', 'presence.json');
    
    let presenceData: Record<string, any> = {};
    try {
      const content = await readFile(presencePath, 'utf-8');
      presenceData = JSON.parse(content);
    } catch (e) {}

    // Limpiar usuarios inactivos (12 segundos)
    const now = new Date().getTime();
    let hasChanged = false;
    const cleanData: Record<string, any> = {};
    
    for (const user in presenceData) {
      const lastSeenTime = new Date(presenceData[user].lastSeen).getTime();
      if (now - lastSeenTime < 12000) {
        cleanData[user] = presenceData[user];
      } else {
        hasChanged = true;
      }
    }

    // Si hubo cambios, guardamos el archivo limpio
    if (hasChanged) {
      const { writeFile } = await import('fs/promises');
      await writeFile(presencePath, JSON.stringify(cleanData, null, 2));
    }

    console.log('Admin Presence Data (Cleaned):', cleanData);
    return NextResponse.json(cleanData);
  } catch (error) {
    return NextResponse.json({ error: 'Error reading presence data' }, { status: 500 });
  }
}
