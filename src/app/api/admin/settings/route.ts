import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'public', 'downloads', 'settings.json');

export async function GET() {
  try {
    const content = await readFile(settingsPath, 'utf-8');
    return NextResponse.json(JSON.parse(content));
  } catch (e) {
    return NextResponse.json({ keyauth_enabled: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newSettings = await request.json();
    await writeFile(settingsPath, JSON.stringify(newSettings, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error saving settings' }, { status: 500 });
  }
}
