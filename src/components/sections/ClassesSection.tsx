import Link from 'next/link';
import { readFile } from 'fs/promises';
import path from 'path';
import styles from './ClassesSection.module.css';
import { t } from '@/lib/translations';
import { getLocale } from '@/lib/getLocale';

interface Cohort {
  id: string;
  year: number;
  title: string;
  description: string;
  rep_name: string;
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

export default async function ClassesSection() {
  const cohorts = await getCohorts();
  const locale = await getLocale();

  return (
    <section className={styles.section} id="classes" aria-label="Class cohorts">
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className="section-label">{t('classes.label', locale)}</div>
            <h2 className={styles.title}>
              {t('classes.title_1', locale)} <span className="text-gradient-gold">{t('classes.title_2', locale)}</span>
            </h2>
            <p className={styles.subtitle}>
              {t('classes.subtitle', locale)}
            </p>
          </div>
          <Link href="/classes" className="btn-gold" id="classes-view-all-btn">
            {t('classes.view_all', locale)}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>

        {/* Cards Grid */}
        <div className={styles.grid} role="list">
          {cohorts.map((cohort, i) => {
            const colorKey = PALETTE[i % PALETTE.length];
            const accent = colorMap[colorKey];
            const maxYear = cohorts.length > 0 ? Math.max(...cohorts.map((c) => c.year)) : new Date().getFullYear();
            const year = maxYear - cohort.year + 1;
            return (
              <article
                key={cohort.id}
                className={`${styles.card} glass-card`}
                role="listitem"
                aria-label={`${cohort.title}, ${cohort.student_count} students`}
                style={{ '--accent': accent } as React.CSSProperties}
              >
                {/* Top stripe */}
                <div className={styles.stripe} style={{ background: accent }} aria-hidden="true" />

                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.cohortLabel}>{cohort.title}</span>
                    <h3 className={styles.cardTitle}>{t('classes.year_prefix', locale)} {year}</h3>
                  </div>
                  <div className={styles.statusBadge} aria-label={`Status: ${cohort.status}`}>
                    <span className={styles.statusDot} />
                    {cohort.status}
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '8px 0 12px', lineHeight: 1.5 }}>
                  {cohort.description}
                </p>

                {/* Stats Row */}
                <div className={styles.statsRow}>
                  <div className={styles.stat}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    <span><strong style={{ color: accent }}>{cohort.student_count}</strong> {t('classes.students', locale)}</span>
                  </div>
                  <div className={styles.stat}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>{t('classes.rep', locale)} <strong style={{ color: 'var(--text-primary)' }}>{cohort.rep_name}</strong></span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={`/classes/${cohort.id}`}
                  className={styles.viewBtn}
                  id={`class-card-${cohort.id}`}
                  aria-label={`View ${cohort.title} details`}
                >
                  {t('classes.view_hub', locale)}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
