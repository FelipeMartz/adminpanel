import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Si tiene la cookie legacy de KeyAuth, permitir paso (opcional)
    const legacySession = req.cookies.get('admin_session');
    if (legacySession) {
      return NextResponse.next();
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Si hay token de NextAuth o cookie legacy
        const legacySession = req.cookies.get('admin_session');
        return !!token || !!legacySession;
      },
    },
  }
);

export const config = { matcher: ["/dashboard/:path*"] };
