import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Verify the requester is the owner
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    if (session?.value !== 'owner') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD || '';
    return NextResponse.json({ success: true, password: adminPassword });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
