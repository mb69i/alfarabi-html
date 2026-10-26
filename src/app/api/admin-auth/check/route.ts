import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  const value = sessionCookie?.value;

  // Both 'admin' and 'owner' are valid admin sessions
  const isAdmin = value === 'admin' || value === 'owner' || value === 'true';
  const isOwner = value === 'owner';

  return NextResponse.json({ isAdmin, isOwner });
}
