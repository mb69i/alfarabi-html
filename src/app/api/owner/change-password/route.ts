import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    // Verify the requester is the owner
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    if (session?.value !== 'owner') {
      return NextResponse.json({ success: false, error: 'Unauthorized — owner access required' }, { status: 403 });
    }

    const { newPassword } = await request.json();

    if (!newPassword || newPassword.trim().length < 4) {
      return NextResponse.json({ success: false, error: 'Password must be at least 4 characters' }, { status: 400 });
    }

    // Read the .env.local file and update ADMIN_PASSWORD
    const envPath = join(process.cwd(), '.env.local');
    let envContent = readFileSync(envPath, 'utf-8');

    // Replace the existing ADMIN_PASSWORD line
    if (envContent.includes('ADMIN_PASSWORD=')) {
      envContent = envContent.replace(
        /ADMIN_PASSWORD=.*/,
        `ADMIN_PASSWORD=${newPassword.trim()}`
      );
    } else {
      // Add it if it doesn't exist
      envContent += `\nADMIN_PASSWORD=${newPassword.trim()}\n`;
    }

    writeFileSync(envPath, envContent, 'utf-8');

    return NextResponse.json({ success: true, message: 'Admin password updated. Restart the server for changes to take effect.' });
  } catch (err) {
    console.error('Failed to change admin password:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
