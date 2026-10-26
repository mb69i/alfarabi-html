import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminCookie = request.cookies.get('admin_session');
  const sessionValue = adminCookie?.value;

  // ── Protect /owner ─────────────────────────────────────────────
  if (pathname.startsWith('/owner')) {
    if (sessionValue === 'owner') {
      return NextResponse.next();
    }
    // Not an owner → redirect to sign-in
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // ── Protect /admin ─────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Both 'admin' and 'owner' can access the admin dashboard
    if (sessionValue === 'true' || sessionValue === 'admin' || sessionValue === 'owner') {
      return NextResponse.next();
    }
    // No valid session → redirect to sign-in
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // ── Redirect already-authenticated users away from sign-in ────
  if (pathname === '/sign-in') {
    if (sessionValue === 'owner') {
      return NextResponse.redirect(new URL('/owner', request.url));
    }
    if (sessionValue === 'true' || sessionValue === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
