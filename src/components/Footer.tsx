import Link from 'next/link';
import { readFile } from 'fs/promises';
import path from 'path';
import styles from './Footer.module.css';
import { t } from '@/lib/translations';
import { getLocale } from '@/lib/getLocale';

interface SiteSettings {
  site_name: string;
  department_name: string;
  city: string;
  country: string;
  contact_email: string;
  phone: string;
  logo_url: string;
  description: string;
  social_telegram: string;
  social_instagram: string;
  social_linkedin: string;
  social_youtube: string;
  social_twitter: string;
  social_facebook: string;
}

async function getSettings(): Promise<SiteSettings> {
  const file = path.join(process.cwd(), 'src', 'data', 'site-settings.json');
  const raw = await readFile(file, 'utf-8');
  return JSON.parse(raw);
}

function buildSocials(s: SiteSettings) {
  const all = [
    {
      label: 'Telegram',
      href: s.social_telegram,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 100 12a12 12 0 0011.944-12zm3.82 8.265l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.565 14.04l-2.94-.916c-.638-.203-.65-.638.136-.945l11.49-4.43c.532-.194.998.13.813.917z"/></svg>,
    },
    {
      label: 'Instagram',
      href: s.social_instagram,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
    },
    {
      label: 'LinkedIn',
      href: s.social_linkedin,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    },
    {
      label: 'YouTube',
      href: s.social_youtube,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>,
    },
    {
      label: 'Twitter',
      href: s.social_twitter,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    },
    {
      label: 'Facebook',
      href: s.social_facebook,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    },
  ];
  // Only show socials that have a URL configured
  return all.filter((item) => item.href && item.href.trim() !== '');
}

export default async function Footer() {
  const settings = await getSettings();
  const locale = await getLocale();
  const socials = buildSocials(settings);

  const footerLinks = {
    [t('footer.academic', locale)]: [
      { label: t('footer.programs', locale), href: '/programs' },
      { label: t('footer.classes', locale), href: '/classes' },
      { label: t('footer.calendar', locale), href: '/calendar' },
      { label: t('footer.research', locale), href: '/research' },
    ],
    [t('footer.community', locale)]: [
      { label: t('footer.news', locale), href: '/news' },
      { label: t('footer.portfolio', locale), href: '/portfolio' },
      { label: t('footer.events', locale), href: '/calendar' },
      { label: t('footer.alumni', locale), href: '/alumni' },
    ],
    [t('footer.institution', locale)]: [
      { label: t('footer.about', locale), href: '/about' },
      { label: t('footer.faculty', locale), href: '/faculty' },
      { label: t('footer.contact', locale), href: '/contact' },
      { label: t('footer.admin', locale), href: '/admin' },
    ],
    [t('footer.account', locale)]: [
      { label: t('footer.signin', locale), href: '/sign-in' },
      { label: t('footer.privacy', locale), href: '/privacy' },
    ],
  };

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.separator} aria-hidden="true" />

      <div className={styles.inner}>
        {/* Brand Column */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logoLink} aria-label="Alfarabi University Home">
            <div className={styles.logoIcon}>
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={settings.site_name || 'Logo'} width={40} height={40} style={{ borderRadius: '8px', objectFit: 'contain' }} />
              ) : (
                <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M30 4L8 14v20c0 12.5 9.5 22.5 22 26 12.5-3.5 22-13.5 22-26V14L30 4z" fill="url(#f-shield)" stroke="url(#f-gold)" strokeWidth="1.5"/>
                  <text x="30" y="36" textAnchor="middle" fontFamily="Playfair Display, serif" fontWeight="800" fontSize="22" fill="white">F</text>
                  <path d="M22 20h16l-8-6-8 6z" fill="rgba(212,175,55,0.9)"/>
                  <rect x="29" y="19" width="2" height="5" fill="rgba(212,175,55,0.8)"/>
                  <defs>
                    <linearGradient id="f-shield" x1="8" y1="4" x2="52" y2="60" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#1C2541"/><stop offset="1" stopColor="#0B132B"/>
                    </linearGradient>
                    <linearGradient id="f-gold" x1="8" y1="4" x2="52" y2="60" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#D4AF37"/><stop offset="1" stopColor="#a8891f"/>
                    </linearGradient>
                  </defs>
                </svg>
              )}
            </div>
            <div>
              <div className={styles.logoName}>{settings.site_name}</div>
              {settings.department_name && <div className={styles.logoTagline}>{settings.department_name}</div>}
            </div>
          </Link>

          {settings.description && <p className={styles.brandDesc}>{settings.description}</p>}

          {/* Contact Info */}
          <div className={styles.contactInfo}>
            {(settings.city || settings.country) && (
              <div className={styles.contactItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {[settings.city, settings.country].filter(Boolean).join(', ')}
              </div>
            )}
            {settings.contact_email && (
              <a href={`mailto:${settings.contact_email}`} className={`${styles.contactItem} ${styles.contactLink}`} id="footer-email-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {settings.contact_email}
              </a>
            )}
            {settings.phone && (
              <div className={styles.contactItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012.03 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.31-1.31a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                {settings.phone}
              </div>
            )}
          </div>

          {/* Socials */}
          <div className={styles.socials} role="list" aria-label="Social media links">
            {socials.map((s) => (
              <a key={s.label} href={s.href} className={styles.socialLink} aria-label={s.label} target="_blank" rel="noopener noreferrer" role="listitem">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Nav Columns */}
        {Object.entries(footerLinks).map(([section, links]) => (
          <div key={section} className={styles.col}>
            <h3 className={styles.colTitle}>{section}</h3>
            <nav aria-label={`${section} links`}>
              <ul className={styles.colLinks}>
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className={styles.colLink}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} {settings.site_name}. {t('footer.rights', locale)}
          </p>
          <div className={styles.credits}>
            <span className={styles.creditsItem}>
              <span className={styles.creditsRole}>{t('footer.developed_by', locale)}</span>
              <span className={styles.creditsName}>Mohammed Albaqir Ali</span>
            </span>
            <span className={styles.creditsDivider} aria-hidden="true">·</span>
            <span className={styles.creditsItem}>
              <span className={styles.creditsRole}>{t('footer.supervised_by', locale)}</span>
              <span className={styles.creditsName}>Cenaa Ghani</span>
            </span>
          </div>
          <div className={styles.bottomLinks}>
            <Link href="/privacy" className={styles.bottomLink}>{t('footer.privacy', locale)}</Link>
            <Link href="/terms" className={styles.bottomLink}>{t('footer.terms', locale)}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
