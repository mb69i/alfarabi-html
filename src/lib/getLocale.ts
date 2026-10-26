import { cookies } from 'next/headers';
import type { Locale } from './translations';

/**
 * Read the user's locale preference from cookies (server-side).
 * Falls back to 'en' if not set.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('alfarabi-locale')?.value;
  return (locale === 'ar' || locale === 'en') ? locale : 'en';
}
