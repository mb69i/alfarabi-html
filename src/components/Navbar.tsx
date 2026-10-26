'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

const navLinks = [
  { key: 'nav.home',      href: '/' },
  { key: 'nav.about',     href: '/about' },
  { key: 'nav.programs',  href: '/programs' },
  { key: 'nav.classes',   href: '/classes' },
  { key: 'nav.calendar',  href: '/calendar' },
  { key: 'nav.news',      href: '/news' },
  { key: 'nav.portfolio', href: '/portfolio' },
];

export default function Navbar() {
  const { isAdmin, loading, signOut } = useAuth();
  const { t, locale, toggleLocale } = useLanguage();
  const pathname = usePathname();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [logoUrl, setLogoUrl]     = useState('');
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch logo URL from settings
  useEffect(() => {
    fetch('/api/cms?file=site-settings')
      .then((r) => r.json())
      .then((s) => { if (s?.logo_url) setLogoUrl(s.logo_url); })
      .catch(() => {});
  }, []);

  // Close mobile menu on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header
      ref={navRef}
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
      role="banner"
    >
      <div className={styles.inner}>
        {/* ── Logo ── */}
        <Link href="/" className={styles.logo} aria-label="Alfarabi University Home">
          <div className={styles.logoIcon}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" width={36} height={36} style={{ borderRadius: '6px', objectFit: 'contain' }} />
            ) : (
              <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                {/* Shield shape */}
                <path
                  d="M30 4L8 14v20c0 12.5 9.5 22.5 22 26 12.5-3.5 22-13.5 22-26V14L30 4z"
                  fill="url(#shield-grad)"
                  stroke="url(#gold-stroke)"
                  strokeWidth="1.5"
                />
                {/* F letter */}
                <text
                  x="30" y="36"
                  textAnchor="middle"
                  fontFamily="Playfair Display, serif"
                  fontWeight="800"
                  fontSize="22"
                  fill="white"
                >F</text>
                {/* Graduation cap */}
                <path d="M22 20h16l-8-6-8 6z" fill="rgba(212,175,55,0.9)" />
                <rect x="29" y="19" width="2" height="5" fill="rgba(212,175,55,0.8)" />
                <defs>
                  <linearGradient id="shield-grad" x1="8" y1="4" x2="52" y2="60" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1C2541"/>
                    <stop offset="1" stopColor="#0B132B"/>
                  </linearGradient>
                  <linearGradient id="gold-stroke" x1="8" y1="4" x2="52" y2="60" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#D4AF37"/>
                    <stop offset="1" stopColor="#a8891f"/>
                  </linearGradient>
                </defs>
              </svg>
            )}
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoMain}>
              {locale === 'ar' ? 'الفارابي' : 'Alfarabi'}
            </span>
            <span className={styles.logoSub}>
              {locale === 'ar' ? 'جامعة · هندسة الذكاء الاصطناعي' : 'University · AI Engineering'}
            </span>
          </div>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <nav className={styles.links} aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {t(link.key)}
              <span className={styles.linkUnderline} aria-hidden="true" />
            </Link>
          ))}
        </nav>

        {/* ── CTA Buttons ── */}
        <div className={styles.actions}>
          {/* Language Toggle */}
          <button
            onClick={toggleLocale}
            className={styles.langToggle}
            aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            id="nav-lang-toggle"
          >
            {locale === 'en' ? 'عربي' : 'EN'}
          </button>

          {loading ? null : isAdmin ? (
            <>
              <Link href="/admin" className={styles.btnLogin} id="nav-admin-btn">{t('nav.dashboard')}</Link>
              <button onClick={signOut} className="btn-primary" id="nav-signout-btn">{t('nav.signout')}</button>
            </>
          ) : (
            <Link href="/sign-in" className={styles.btnLogin} id="nav-login-btn">{t('nav.admin')}</Link>
          )}
        </div>

        {/* ── Hamburger (Mobile) ── */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          id="hamburger-btn"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <nav className={styles.mobileLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.mobileNavLink}
              onClick={() => setMenuOpen(false)}
            >
              {t(link.key)}
            </Link>
          ))}
          <div className={styles.mobileCtas}>
            {/* Mobile Language Toggle */}
            <button
              onClick={toggleLocale}
              className={styles.langToggle}
              id="mobile-lang-toggle"
            >
              {locale === 'en' ? 'عربي · Arabic' : 'EN · English'}
            </button>
            {isAdmin ? (
              <>
                <Link href="/admin" className={styles.btnLogin} onClick={() => setMenuOpen(false)} id="mobile-dashboard-btn">{t('nav.dashboard')}</Link>
                <button onClick={() => { setMenuOpen(false); signOut(); }} className="btn-primary" id="mobile-signout-btn">{t('nav.signout')}</button>
              </>
            ) : (
              <Link href="/sign-in" className={styles.btnLogin} onClick={() => setMenuOpen(false)} id="mobile-login-btn">{t('nav.admin')}</Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
