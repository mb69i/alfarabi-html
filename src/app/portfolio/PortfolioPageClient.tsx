'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { useLanguage } from '@/context/LanguageContext';
import styles from './portfolio.module.css';

interface Project {
  id: string;
  title: string;
  description: string;
  student_name: string;
  cohort: string;
  tags: string[];
  github_url: string;
  demo_url: string;
  status: string;
  submitted_at: string;
}

const ACCENT_PALETTE = ['var(--gold)', 'var(--crimson-light)', '#7eb3f9', '#4ade80', '#a78bfa', '#fb923c'];

export default function PortfolioPageClient({ projects }: { projects: Project[] }) {
  const { t, locale } = useLanguage();
  const [activeTag, setActiveTag] = useState('All');

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach((p) => p.tags.forEach((tag) => tags.add(tag)));
    return [t('portfolio.filter_all'), ...Array.from(tags)];
  }, [projects, t]);

  const filteredProjects = useMemo(() => {
    if (activeTag === t('portfolio.filter_all')) return projects;
    return projects.filter((p) => p.tags.includes(activeTag));
  }, [activeTag, projects, t]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className="orb" style={{ width: 280, height: 280, top: '5%', right: '8%', background: 'rgba(126,179,249,0.07)' }} aria-hidden="true" />
        <div className="orb orb-slow" style={{ width: 200, height: 200, bottom: '10%', left: '5%', background: 'rgba(212,175,55,0.06)' }} aria-hidden="true" />
        <div className="container">
          <div className={styles.breadcrumb}>
            <Link href="/">{t('common.home')}</Link><span>/</span><span>{t('nav.portfolio')}</span>
          </div>
          <div className="section-label animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>{t('portfolio.label')}</div>
          <h1 className={`${styles.heroTitle} animate-fade-in-up`} style={{ animationDelay: '200ms', opacity: 0 }}>
            {t('portfolio.title_1')} <span className="text-gradient-gold">{t('portfolio.title_2')}</span>
          </h1>
          <p className={`${styles.heroSub} animate-fade-in-up`} style={{ animationDelay: '330ms', opacity: 0 }}>
            {t('portfolio.subtitle')}
          </p>
        </div>
      </section>

      <div className="container">
        {/* Featured Projects (first 3) */}
        {projects.length > 0 && (
          <section className={styles.featuredSection}>
            <AnimateOnScroll>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>⭐ {locale === 'ar' ? 'مشاريع مميزة' : 'Featured Projects'}</h2>
              </div>
            </AnimateOnScroll>
            <div className={styles.featuredGrid}>
              {projects.slice(0, 3).map((p, i) => {
                const accent = ACCENT_PALETTE[i % ACCENT_PALETTE.length];
                return (
                  <AnimateOnScroll key={p.id} delay={i * 100} direction="up">
                    <article className={`${styles.featuredCard} glass-card`} style={{ '--accent': accent } as React.CSSProperties}>
                      <div className={styles.topBar} style={{ background: accent }} />
                      <div className={styles.cardBody}>
                        <div className={styles.cardMeta}>
                          <span className={styles.cohortLabel}>{p.cohort}</span>
                        </div>
                        <h3 className={styles.cardTitle}>{p.title}</h3>
                        <p className={styles.cardDesc}>{p.description}</p>
                        <div className={styles.tags}>
                          {p.tags.map((tag) => (
                            <span key={tag} className={styles.tag} style={{ borderColor: `${accent}50`, color: accent }}>{tag}</span>
                          ))}
                        </div>
                        <div className={styles.cardFooter}>
                          <div className={styles.authorRow}>
                            <div className={styles.authorDot} style={{ background: accent }} />
                            <span className={styles.authorName}>{p.student_name}</span>
                          </div>
                          <div className={styles.links}>
                            {p.github_url && (
                              <a href={p.github_url} className={styles.linkBtn} target="_blank" rel="noopener noreferrer" aria-label="View on GitHub" style={{ borderColor: `${accent}40`, color: accent }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                                {t('portfolio.github')}
                              </a>
                            )}
                            {p.demo_url && (
                              <a href={p.demo_url} className={styles.linkBtn} target="_blank" rel="noopener noreferrer" aria-label="View live demo" style={{ borderColor: `${accent}40`, color: accent }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                {t('portfolio.demo')}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </section>
        )}

        {/* All Projects with tag filter */}
        <section className={styles.allSection}>
          <AnimateOnScroll>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t('portfolio.filter_all')}</h2>
              <div className={styles.filterRow}>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    className={`${styles.filterBtn} ${activeTag === tag ? styles.filterActive : ''}`}
                    id={`portfolio-filter-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setActiveTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </AnimateOnScroll>

          {filteredProjects.length === 0 ? (
            <AnimateOnScroll>
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                {locale === 'ar' ? `لا توجد مشاريع تطابق "${activeTag}".` : `No projects match "${activeTag}".`}{' '}
                <button onClick={() => setActiveTag(t('portfolio.filter_all'))} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>{locale === 'ar' ? 'عرض الكل' : 'Show all'}</button>
              </div>
            </AnimateOnScroll>
          ) : (
            <div className={styles.grid}>
              {filteredProjects.map((p, i) => {
                const accent = ACCENT_PALETTE[(i + 3) % ACCENT_PALETTE.length];
                return (
                  <AnimateOnScroll key={p.id} delay={i * 80}>
                    <article className={`${styles.smallCard} glass-card`} style={{ '--accent': accent } as React.CSSProperties}>
                      <div className={styles.topBar} style={{ background: accent }} />
                      <div className={styles.cardBody}>
                        <span className={styles.cohortLabel}>{p.cohort}</span>
                        <h3 className={styles.smallTitle}>{p.title}</h3>
                        <p className={styles.cardDesc}>{p.description}</p>
                        <div className={styles.tags}>
                          {p.tags.map((tag) => (
                            <span key={tag} className={styles.tag} style={{ borderColor: `${accent}50`, color: accent }}>{tag}</span>
                          ))}
                        </div>
                        <div className={styles.cardFooter}>
                          <div className={styles.authorRow}>
                            <div className={styles.authorDot} style={{ background: accent }} />
                            <span className={styles.authorName}>{p.student_name}</span>
                          </div>
                          <div className={styles.links}>
                            {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className={styles.linkBtn} style={{ borderColor: `${accent}40`, color: accent }}>{t('portfolio.github')}</a>}
                            {p.demo_url && <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className={styles.linkBtn} style={{ borderColor: `${accent}40`, color: accent }}>{t('portfolio.demo')}</a>}
                          </div>
                        </div>
                      </div>
                    </article>
                  </AnimateOnScroll>
                );
              })}
            </div>
          )}
        </section>

        {/* Submit CTA */}
        <AnimateOnScroll>
          <div className={styles.submitCta}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>{locale === 'ar' ? 'بنيت شيئاً مميزاً؟' : 'Built something amazing?'}</h2>
              <p className={styles.ctaDesc}>{locale === 'ar' ? 'قدّم مشروعك للمراجعة ليتم عرضه في معرض الجامعة.' : 'Submit your project for review to be featured in the university portfolio showcase.'}</p>
            </div>
            <Link href="/sign-in" className="btn-gold" id="portfolio-submit-project-btn">
              {locale === 'ar' ? '← قدّم مشروعك' : 'Submit Your Project →'}
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  );
}
