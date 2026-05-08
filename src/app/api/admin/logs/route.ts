import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const logsPath = path.join(process.cwd(), 'public', 'downloads', 'logs.json');
    
    let logsData = [];
    try {
      const content = await readFile(logsPath, 'utf-8');
      logsData = JSON.parse(content);
    } catch (e) {
      // File might not exist yet
    }

    return NextResponse.json(logsData);
  } catch (error) {
    return NextResponse.json({ error: 'Error reading logs' }, { status: 500 });
  }
}
