import Link from 'next/link';
import { readFile } from 'fs/promises';
import path from 'path';
import styles from './NewsSection.module.css';
import { t } from '@/lib/translations';
import { getLocale } from '@/lib/getLocale';

interface Article {
  id: string;
  type: string;
  title: string;
  summary: string;
  author: string;
  published_at: string;
  status: string;
}

async function getNews(): Promise<Article[]> {
  const file = path.join(process.cwd(), 'src', 'data', 'articles.json');
  const raw = await readFile(file, 'utf-8');
  const all: Article[] = JSON.parse(raw);
  return all.filter((a) => a.type === 'news' && a.status === 'published');
}

const TAG_COLORS: Record<string, string> = {
  news: 'gold',
  event: 'crimson',
};

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-IQ' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function NewsSection() {
  const newsItems = await getNews();
  const locale = await getLocale();
  const [featured, ...rest] = newsItems;

  if (!featured) return null;

  return (
    <section className={styles.section} id="news" aria-label="Latest news">
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className="section-label">{t('news.label', locale)}</div>
            <h2 className={styles.title}>
              {t('news.title_1', locale)} <span className="text-gradient-crimson">{t('news.title_2', locale)}</span>
            </h2>
          </div>
          <Link href="/news" className="btn-gold" id="news-view-all-btn">
            {t('news.view_all', locale)}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {/* Featured Article */}
          <article className={`${styles.featuredCard} glass-card`} aria-label={`Featured: ${featured.title}`}>
            <div className={styles.featuredInner}>
              <div className={styles.featuredTop}>
                <span className={`${styles.tag} ${styles[`tag_${TAG_COLORS[featured.type] ?? 'gold'}`]}`}>
                  {featured.type === 'news' ? t('news.type_news', locale) : t('news.type_event', locale)}
                </span>
                <span className={styles.featuredBadge}>{t('news.featured', locale)}</span>
              </div>
              <h3 className={styles.featuredTitle}>{featured.title}</h3>
              <p className={styles.featuredExcerpt}>{featured.summary}</p>
              <div className={styles.featuredFooter}>
                <span className={styles.date}>{formatDate(featured.published_at, locale)}</span>
                <span className={styles.readTime}>{featured.author}</span>
              </div>
              <Link href={`/news#${featured.id}`} className={styles.readMore} id={`news-featured-${featured.id}`}>
                {t('news.read_full', locale)}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </article>

          {/* News List */}
          <div className={styles.newsList}>
            {rest.slice(0, 3).map((item) => (
              <article
                key={item.id}
                className={`${styles.newsCard} glass`}
                aria-label={item.title}
              >
                <div className={styles.newsTop}>
                  <span className={`${styles.tag} ${styles[`tag_${TAG_COLORS[item.type] ?? 'gold'}`]}`}>
                    {item.type === 'news' ? t('news.type_news', locale) : t('news.type_event', locale)}
                  </span>
                </div>
                <h3 className={styles.newsTitle}>{item.title}</h3>
                <p className={styles.newsExcerpt}>{item.summary}</p>
                <div className={styles.newsFooter}>
                  <span className={styles.date}>{formatDate(item.published_at, locale)}</span>
                  <Link href={`/news#${item.id}`} className={styles.readMore} id={`news-card-${item.id}`}>
                    {t('news.read_more', locale)}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
