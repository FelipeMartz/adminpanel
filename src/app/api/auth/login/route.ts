import { NextResponse } from 'next/server';
import { keyAuth } from '@/lib/keyauth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Faltan credenciales' }, { status: 400 });
    }

    const result = await keyAuth.login(username, password);

    if (result.success) {
      // In a real app, you'd use JWT or sessions. 
      // For simplicity, we'll set a cookie.
      const response = NextResponse.json({ 
        success: true, 
        message: 'Login exitoso',
        user: result.info 
      });
      
      response.cookies.set('admin_session', 'true', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/'
      });

      return response;
    }

    return NextResponse.json({ success: false, message: result.message }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error en el servidor' }, { status: 500 });
  }
}
