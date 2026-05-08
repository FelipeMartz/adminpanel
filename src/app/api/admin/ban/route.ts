import { NextResponse } from 'next/server';
import { keyAuth } from '@/lib/keyauth';

export async function POST(request: Request) {
  try {
    const { username, reason } = await request.json();

    if (!username) {
      return NextResponse.json({ success: false, message: 'Usuario requerido' }, { status: 400 });
    }

    const result = await keyAuth.banUser(username, reason);

    if (result.success) {
      return NextResponse.json({ success: true, message: `Usuario ${username} baneado exitosamente` });
    }

    return NextResponse.json({ success: false, message: result.message }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al procesar el baneo' }, { status: 500 });
  }
}
