import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Supabase sends the user here after email confirmation or OAuth login.
// We exchange the auth code for a session, then redirect to the app.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/profile';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If the code exchange failed, send to sign-in with an error flag
  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`);
}
