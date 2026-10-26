import type { Metadata } from 'next';
import Link from 'next/link';
import { readFile } from 'fs/promises';
import path from 'path';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import Footer from '@/components/Footer';
import styles from './classes.module.css';
import { t } from '@/lib/translations';
import { getLocale } from '@/lib/getLocale';

export const metadata: Metadata = {
  title: 'Classes & Cohorts — Alfarabi University AI Engineering',
  description: 'Browse all active AI Engineering cohorts at Al-Farabi University. View student rosters, faculty, and class hubs.',
};

interface Cohort {
  id: string;
  year: number;
  title: string;
  description: string;
  rep_name: string;
  rep_email: string;
  student_count: number;
  status: string;
}

async function getCohorts(): Promise<Cohort[]> {
  const file = path.join(process.cwd(), 'src', 'data', 'cohorts.json');
  const raw = await readFile(file, 'utf-8');
  return JSON.parse(raw);
}

const PALETTE = ['gold', 'crimson', 'blue', 'navy'];
const colorMap: Record<string, string> = {
  gold: 'var(--gold)',
  crimson: 'var(--crimson-light)',
  blue: '#7eb3f9',
  navy: '#6a78a0',
};

export default async function ClassesPage() {
  const cohorts = await getCohorts();
  const locale = await getLocale();
  const totalStudents = cohorts.reduce((sum, c) => sum + c.student_count, 0);
  const maxYear = cohorts.length > 0 ? Math.max(...cohorts.map((c) => c.year)) : new Date().getFullYear();

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.breadcrumb}>
            <Link href="/">{t('common.home', locale)}</Link>
            <span>/</span>
            <span>{t('nav.classes', locale)}</span>
          </div>
          <div className="section-label animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>{t('classes.label', locale)}</div>
          <h1 className={`${styles.heroTitle} animate-fade-in-up`} style={{ animationDelay: '200ms', opacity: 0 }}>
            {t('classes.page_title_1', locale)} <span className="text-gradient-gold">{t('classes.page_title_2', locale)}</span>
          </h1>
          <p className={`${styles.heroSubtitle} animate-fade-in-up`} style={{ animationDelay: '330ms', opacity: 0 }}>
            {cohorts.length} active cohorts · {totalStudents.toLocaleString()} enrolled students · Al-Farabi University, Baghdad
          </p>
        </div>
        <div className="orb" style={{ width: 280, height: 280, top: '-40px', right: '5%', background: 'rgba(212,175,55,0.07)' }} aria-hidden="true" />
        <div className={styles.heroBg} aria-hidden="true" />
      </section>

      {/* Stats Strip */}
      <div className={styles.statsStrip}>
        <div className="container">
          <div className={styles.statsGrid}>
            <div className={styles.stripStat}>
              <span className={styles.stripNum}>{totalStudents}</span>
              <span className={styles.stripLabel}>{t('classes.total_students', locale)}</span>
            </div>
            <div className={styles.stripStat}>
              <span className={styles.stripNum}>{cohorts.length}</span>
              <span className={styles.stripLabel}>{t('classes.active_cohorts', locale)}</span>
            </div>
            <div className={styles.stripStat}>
              <span className={styles.stripNum}>{cohorts.filter((c) => c.status === 'active').length}</span>
              <span className={styles.stripLabel}>{t('classes.active_classes', locale)}</span>
            </div>
            <div className={styles.stripStat}>
              <span className={styles.stripNum}>{cohorts.length}</span>
              <span className={styles.stripLabel}>{t('classes.class_reps', locale)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.grid}>
            {cohorts.map((cohort, i) => {
              const colorKey = PALETTE[i % PALETTE.length];
              const accent = colorMap[colorKey];
              const year = maxYear - cohort.year + 1;
              return (
                <AnimateOnScroll key={cohort.id} delay={i * 100}>
                  <article
                    className={`${styles.card} glass-card`}
                    style={{ '--accent': accent } as React.CSSProperties}
                  >
                    <div className={styles.topBar} style={{ background: accent }} aria-hidden="true" />
                    <div className={styles.cardInner}>
                      <div className={styles.cardHeader}>
                        <div>
                          <span className={styles.cohortBadge}>{cohort.title}</span>
                          <h2 className={styles.cardTitle}>{t('classes.year_prefix', locale)} {year}</h2>
                        </div>
                        <div className={styles.activeBadge}>
                          <span className={styles.activeDot} style={{ animation: 'dotPulse 2s ease-in-out infinite' }} />
                          {cohort.status}
                        </div>
                      </div>

                      <p className={styles.cardDesc}>{cohort.description}</p>

                      {/* Info Grid */}
                      <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                          <div>
                            <span className={styles.infoLabel}>{t('classes.students', locale)}</span>
                            <span className={styles.infoValue} style={{ color: accent }}>{cohort.student_count}</span>
                          </div>
                        </div>
                        <div className={styles.infoItem}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          <div>
                            <span className={styles.infoLabel}>{t('classes.representative', locale)}</span>
                            <span className={styles.infoValue}>{cohort.rep_name}</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/classes/${cohort.id}`}
                        className={styles.cta}
                        style={{ '--accent': accent, borderColor: accent, color: accent } as React.CSSProperties}
                        id={`classes-page-card-${cohort.id}`}
                      >
                        {t('classes.view_hub', locale)}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </Link>
                    </div>
                  </article>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
