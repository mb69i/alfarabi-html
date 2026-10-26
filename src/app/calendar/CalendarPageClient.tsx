'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import styles from './calendar.module.css';

interface CalendarEvent {
  id: string;
  title: string;
  summary: string;
  author: string;
  event_date?: string;
  published_at: string;
  category?: string;
  location?: string;
  time?: string;
  cohort?: string;
}

const categoryColors: Record<string, string> = {
  Academic: 'var(--gold)',
  Hackathon: '#7eb3f9',
  Seminar: '#a78bfa',
  Deadline: 'var(--crimson-light)',
  Admin: '#6a78a0',
  Public: '#4ade80',
  Event: 'var(--gold)',
};

function getCategories(events: CalendarEvent[]): string[] {
  const cats = new Set(events.map((e) => e.category ?? 'Event'));
  return ['All', ...Array.from(cats)];
}

function getCohorts(events: CalendarEvent[]): string[] {
  const cohs = new Set(events.map((e) => e.cohort).filter(Boolean) as string[]);
  return ['All Cohorts', ...Array.from(cohs)];
}

export default function CalendarPageClient({ events }: { events: CalendarEvent[] }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeCohort, setActiveCohort]     = useState('All Cohorts');

  const categories = useMemo(() => getCategories(events), [events]);
  const cohorts    = useMemo(() => getCohorts(events), [events]);

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      const cat = ev.category ?? 'Event';
      const coh = ev.cohort ?? 'All';
      const catMatch = activeCategory === 'All' || cat === activeCategory;
      const cohortMatch = activeCohort === 'All Cohorts' || coh === activeCohort || coh === 'All';
      return catMatch && cohortMatch;
    });
  }, [events, activeCategory, activeCohort]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className="orb" style={{ width: 300, height: 300, top: '10%', left: '5%', background: 'rgba(165,28,48,0.07)' }} aria-hidden="true" />
        <div className="orb orb-slow" style={{ width: 200, height: 200, bottom: '15%', right: '10%', background: 'rgba(212,175,55,0.06)' }} aria-hidden="true" />
        <div className="container">
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link><span>/</span><span>Calendar</span>
          </div>
          <div className="section-label animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>Academic Schedule</div>
          <h1 className={`${styles.heroTitle} animate-fade-in-up`} style={{ animationDelay: '200ms', opacity: 0 }}>
            University <span className="text-gradient-gold">Calendar</span>
          </h1>
          <p className={`${styles.heroSub} animate-fade-in-up`} style={{ animationDelay: '320ms', opacity: 0 }}>
            All upcoming events, deadlines, and seminars across all cohorts.
          </p>
        </div>
      </section>

      <div className="container">
        {/* Empty state */}
        {events.length === 0 && (
          <AnimateOnScroll>
            <div style={{ textAlign: 'center', padding: '80px 0 60px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📅</div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.3rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
                No Events Scheduled
              </h2>
              <p style={{ maxWidth: 420, margin: '0 auto', lineHeight: 1.7 }}>
                There are no upcoming events at the moment. Check back soon or visit the{' '}
                <Link href="/news" style={{ color: 'var(--gold)' }}>News</Link> page for the latest updates.
              </p>
            </div>
          </AnimateOnScroll>
        )}

        {/* Filters — only show if we have events */}
        {events.length > 0 && (
          <>
            <AnimateOnScroll>
              <div className={styles.filters}>
                <div className={styles.filterGroup}>
                  <span className={styles.filterLabel}>Category</span>
                  <div className={styles.filterRow}>
                    {categories.map((c) => {
                      const color = categoryColors[c];
                      return (
                        <button
                          key={c}
                          className={`${styles.filterChip} ${activeCategory === c ? styles.chipActive : ''}`}
                          id={`cal-filter-${c.toLowerCase()}`}
                          style={c !== 'All' ? { '--chip-color': color } as React.CSSProperties : undefined}
                          onClick={() => setActiveCategory(c)}
                        >
                          {c !== 'All' && <span className={styles.chipDot} style={{ background: color }} />}
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {cohorts.length > 1 && (
                  <div className={styles.filterGroup}>
                    <span className={styles.filterLabel}>Cohort</span>
                    <div className={styles.filterRow}>
                      {cohorts.map((c) => (
                        <button
                          key={c}
                          className={`${styles.filterChip} ${activeCohort === c ? styles.chipActive : ''}`}
                          id={`cal-cohort-${c.toLowerCase().replace(' ', '-')}`}
                          onClick={() => setActiveCohort(c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AnimateOnScroll>

            {/* Summary stats */}
            <AnimateOnScroll delay={80}>
              <div className={styles.summary}>
                <span className={styles.summaryText}>
                  Showing <strong>{filtered.length} event{filtered.length !== 1 ? 's' : ''}</strong>
                  {activeCategory !== 'All' ? ` · ${activeCategory}` : ''}
                  {activeCohort !== 'All Cohorts' ? ` · ${activeCohort}` : ''}
                </span>
              </div>
            </AnimateOnScroll>

            {/* Event List */}
            <div className={styles.eventList}>
              {filtered.length === 0 && (
                <AnimateOnScroll>
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                    No events match your filters.{' '}
                    <button onClick={() => { setActiveCategory('All'); setActiveCohort('All Cohorts'); }} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                      Reset filters
                    </button>
                  </div>
                </AnimateOnScroll>
              )}
              {filtered.map((ev, i) => {
                const color = categoryColors[ev.category ?? 'Event'] || 'var(--gold)';
                const d = new Date(ev.event_date ?? ev.published_at);
                const day = String(d.getDate()).padStart(2, '0');
                const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                return (
                  <AnimateOnScroll key={ev.id} delay={i * 55} direction="up">
                    <div className={`${styles.eventRow} glass-card`} role="article">
                      {/* Date block */}
                      <div className={styles.dateBlock} style={{ borderColor: `${color}30` }}>
                        <span className={styles.dateDay} style={{ color }}>{day}</span>
                        <span className={styles.dateMonth}>{month}</span>
                      </div>

                      {/* Event info */}
                      <div className={styles.eventInfo}>
                        <div className={styles.eventMeta}>
                          <span className={styles.eventCategory} style={{ color, background: `${color}12`, borderColor: `${color}35` }}>
                            {ev.category ?? 'Event'}
                          </span>
                          {ev.cohort && ev.cohort !== 'All' && (
                            <span className={styles.eventCohort}>{ev.cohort}</span>
                          )}
                        </div>
                        <h3 className={styles.eventTitle}>{ev.title}</h3>
                        <div className={styles.eventDetails}>
                          {ev.location && (
                            <span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                              {ev.location}
                            </span>
                          )}
                          {ev.time && (
                            <span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              {ev.time}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Color stripe */}
                      <div className={styles.eventStripe} style={{ background: color }} aria-hidden="true" />
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
