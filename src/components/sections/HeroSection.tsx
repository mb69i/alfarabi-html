import HeroCanvasWrapper from '@/components/sections/HeroCanvasWrapper';
import Link from 'next/link';
import { readFile } from 'fs/promises';
import path from 'path';
import styles from './HeroSection.module.css';
import { t } from '@/lib/translations';
import { getLocale } from '@/lib/getLocale';

interface SiteSettings {
  site_name: string;
  department_name: string;
  hero_title?: string;
  hero_subtitle?: string;
  founded_year?: number;
  total_students?: number;
  research_papers?: number;
}

async function getSettings(): Promise<SiteSettings> {
  const file = path.join(process.cwd(), 'src', 'data', 'site-settings.json');
  const raw = await readFile(file, 'utf-8');
  return JSON.parse(raw);
}

export default async function HeroSection() {
  const s = await getSettings();
  const locale = await getLocale();

  const foundedYear = s.founded_year || 0;
  const yearsActive = foundedYear ? new Date().getFullYear() - foundedYear : 0;

  return (
    <section className={styles.hero} id="hero" aria-label="Hero section">
      {/* Engineering 3D Canvas + gradient overlays (client component) */}
      <HeroCanvasWrapper />

      {/* Content */}
      <div className={styles.content}>
        {/* Badge */}
        <div className={styles.badge} role="text">
          <span className={styles.badgeDot} aria-hidden="true" />
          <span>{t('hero.badge_prefix', locale)}{foundedYear ? ` · ${t('common.est', locale)} ${foundedYear}` : ''}</span>
        </div>

        {/* Headline */}
        <h1 className={styles.headline}>
          <span className={styles.headlineTop}>
            {t('hero.headline_top', locale)}
          </span>
          <span className={`${styles.headlineAccent} text-gradient-gold`}>
            {t('hero.headline_accent', locale)}
          </span>
        </h1>

        {/* Subtext */}
        <p className={styles.sub}>
          {s.hero_subtitle || t('hero.headline_top', locale)}
        </p>

        {/* CTA Buttons */}
        <div className={styles.ctas}>
          <Link href="/programs" className="btn-primary" id="hero-explore-btn">
            {t('hero.explore_programs', locale)}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <Link href="/about" className="btn-gold" id="hero-about-btn">
            {t('hero.our_story', locale)}
          </Link>
        </div>

        {/* Trust badges */}
        <div className={styles.trust} role="list" aria-label="University highlights">
          {[
            { num: yearsActive ? `${yearsActive}+` : '—', label: t('hero.years_excellence', locale) },
            { num: s.total_students ? `${(s.total_students / 1000).toFixed(0)}K+` : '—', label: t('hero.active_students', locale) },
            { num: s.research_papers ? `${s.research_papers}+` : '—', label: t('hero.research_papers', locale) },
            { num: (s as any).dept_ranking || '#1', label: t('hero.top_dept', locale) },
          ].map((item) => (
            <div key={item.label} className={styles.trustItem} role="listitem">
              <span className={styles.trustNum}>{item.num}</span>
              <span className={styles.trustLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator} aria-label={t('hero.scroll_down', locale)}>
        <div className={styles.scrollMouse}>
          <div className={styles.scrollWheel} />
        </div>
      </div>
    </section>
  );
}
