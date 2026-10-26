'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { t as translate, type Locale } from '@/lib/translations';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'alfarabi-locale';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Load saved locale on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === 'ar' || saved === 'en') {
      setLocaleState(saved);
    }
  }, []);

  // Update <html> attributes when locale changes
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('lang', locale);
    html.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    // Sync to cookie so server components can read it
    document.cookie = `alfarabi-locale=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
  }, []);

  const toggleLocale = useCallback(() => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.cookie = `alfarabi-locale=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    // Reload so server components re-render with the new locale
    window.location.reload();
  }, [locale]);

  const t = useCallback((key: string) => translate(key, locale), [locale]);

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
