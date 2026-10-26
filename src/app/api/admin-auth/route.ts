import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Owner password — hardcoded for maximum security (not in .env)
const OWNER_PASSWORD = 'ai.mazin-lol#2025';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Check owner password first
    if (password === OWNER_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set('admin_session', 'owner', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      return NextResponse.json({ success: true, role: 'owner' });
    }

    // Check admin password
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json({ success: false, error: 'Admin password not configured' }, { status: 500 });
    }

    if (password !== adminPassword) {
      return NextResponse.json({ success: false, error: 'Invalid admin password' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'admin', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return NextResponse.json({ success: true, role: 'admin' });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  return NextResponse.json({ success: true });
}
