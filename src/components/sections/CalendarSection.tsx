import Link from 'next/link';
import { readFile } from 'fs/promises';
import path from 'path';
import styles from './CalendarSection.module.css';
import { t } from '@/lib/translations';
import { getLocale } from '@/lib/getLocale';

interface Article {
  id: string;
  type: string;
  title: string;
  summary: string;
  author: string;
  published_at: string;
  event_date?: string;
  status: string;
}

async function getEvents(): Promise<Article[]> {
  const file = path.join(process.cwd(), 'src', 'data', 'articles.json');
  const raw = await readFile(file, 'utf-8');
  const all: Article[] = JSON.parse(raw);
  return all
    .filter((a) => a.type === 'event' && a.status === 'published')
    .sort((a, b) => new Date(a.event_date ?? a.published_at).getTime() - new Date(b.event_date ?? b.published_at).getTime());
}

const CAT_COLORS: Record<string, string> = {
  event: 'crimson',
  news: 'gold',
};

export default async function CalendarSection() {
  const events = await getEvents();
  const locale = await getLocale();

  return (
    <section className={styles.section} id="calendar" aria-label="Upcoming events calendar">
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className="section-label">{t('cal.label', locale)}</div>
            <h2 className={styles.title}>
              {t('cal.title_1', locale)} <span className="text-gradient-gold">{t('cal.title_2', locale)}</span>
            </h2>
            <p className={styles.subtitle}>
              {t('cal.subtitle', locale)}
            </p>
          </div>
          <Link href="/calendar" className="btn-gold" id="calendar-view-all-btn">
            {t('cal.view_all', locale)}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>

        {/* Events List */}
        <div className={styles.eventsGrid} role="list">
          {events.length === 0 && (
            <p style={{ color: 'var(--text-muted)', padding: '20px 0' }}>{t('cal.no_events', locale)}</p>
          )}
          {events.slice(0, 5).map((event, i) => {
            const d = new Date(event.event_date ?? event.published_at);
            const day = String(d.getDate()).padStart(2, '0');
            const month = d.toLocaleString(locale === 'ar' ? 'ar-IQ' : 'en-US', { month: 'short' });
            return (
              <article
                key={event.id}
                className={`${styles.eventCard} glass`}
                role="listitem"
                aria-label={`${event.title} on ${day} ${month}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Date Badge */}
                <div className={styles.dateBadge} aria-label={`${day} ${month}`}>
                  <span className={styles.dateDay}>{day}</span>
                  <span className={styles.dateMonth}>{month}</span>
                </div>

                {/* Event Info */}
                <div className={styles.eventInfo}>
                  <span className={`${styles.category} ${styles[`cat_${CAT_COLORS[event.type] ?? 'gold'}`]}`}>
                    {locale === 'ar' ? 'حدث' : 'Event'}
                  </span>
                  <h3 className={styles.eventTitle}>{event.title}</h3>
                  <div className={styles.eventMeta} aria-label="Event details">
                    <span className={styles.metaItem}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {event.author}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <div className={styles.eventArrow} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
