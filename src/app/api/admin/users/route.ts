import { NextResponse } from 'next/server';
import { keyAuth } from '@/lib/keyauth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    try {
      const result = await keyAuth.fetchAllUsers();
      
      // Leer presencia
      let presenceData: any = {};
      try {
        const presencePath = path.join(process.cwd(), 'public', 'downloads', 'presence.json');
        const content = await readFile(presencePath, 'utf-8');
        presenceData = JSON.parse(content);
      } catch (e) {}

      if (result.success) {
        const usersWithPresence = (result.users || []).map((user: any) => ({
          ...user,
          online: presenceData[user.username] ? true : false,
          lastSeen: presenceData[user.username]?.lastSeen || null
        }));
        return NextResponse.json({ success: true, users: usersWithPresence });
      }
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    } catch (error) {
      return NextResponse.json({ success: false, message: 'Error al listar usuarios' }, { status: 500 });
    }
  }

  try {
    const result = await keyAuth.fetchUser(username);
    if (result.success) {
      return NextResponse.json({ success: true, user: result.info });
    }
    return NextResponse.json({ success: false, message: result.message }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al buscar el usuario' }, { status: 500 });
  }
}
