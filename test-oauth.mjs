
import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = 'https://hgmpxoibgkgobohdblez.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VgccHmVYd8QKFb6z2phtpA_tTULE9bG';

console.log('Testing Supabase client creation...');
try {
  const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Client created successfully');
  
  // Test signInWithOAuth - in browser mode this returns a URL
  const result = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000/auth/callback',
      skipBrowserRedirect: true, // Don't actually redirect in Node
    },
  });
  
  console.log('OAuth result:', JSON.stringify(result, null, 2));
  
  if (result.error) {
    console.error('❌ Error:', result.error.message);
  } else if (result.data?.url) {
    console.log('✅ OAuth URL generated:', result.data.url.substring(0, 100) + '...');
  } else {
    console.log('⚠️  No URL returned - browser redirect may have been attempted');
  }
} catch (e) {
  console.error('❌ Exception:', e.message);
}
