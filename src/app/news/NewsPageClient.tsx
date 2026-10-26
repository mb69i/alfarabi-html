'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { useLanguage } from '@/context/LanguageContext';
import styles from './news.module.css';

interface Article {
  id: string;
  type: string;
  title: string;
  summary: string;
  author: string;
  published_at: string;
  status: string;
}

const TYPE_COLORS: Record<string, string> = {
  news: 'var(--gold)',
  event: 'var(--crimson-light)',
};

export default function NewsPageClient({ articles }: { articles: Article[] }) {
  const { t, locale } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('All');

  const filterTypes = [
    { key: 'All', label: locale === 'ar' ? 'الكل' : 'All' },
    { key: 'News', label: t('news.type_news') },
    { key: 'Events', label: locale === 'ar' ? 'أحداث' : 'Events' },
  ];

  const filteredArticles = useMemo(() => {
    if (activeFilter === 'All') return articles;
    const filterKey = activeFilter === 'News' ? 'news' : 'event';
    return articles.filter((a) => a.type === filterKey);
  }, [activeFilter, articles]);

  const [featured, ...rest] = articles;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-IQ' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  if (!featured) {
    return (
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className="container">
            <h1 className={styles.heroTitle}>{t('news.page_title_1')} <span className="text-gradient-gold">{t('news.page_title_2')}</span></h1>
          </div>
        </section>
        <div className="container" style={{ padding: '60px 0', color: 'var(--text-muted)', textAlign: 'center' }}>
          {t('news.no_articles')}
        </div>
      </div>
    );
  }

  const featuredColor = TYPE_COLORS[featured.type] ?? 'var(--gold)';

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className="orb" style={{ width: 320, height: 320, top: '5%', left: '3%', background: 'rgba(212,175,55,0.06)' }} aria-hidden="true" />
        <div className="orb orb-slow" style={{ width: 200, height: 200, bottom: '10%', right: '8%', background: 'rgba(165,28,48,0.07)' }} aria-hidden="true" />
        <div className="container">
          <div className={styles.breadcrumb}>
            <Link href="/">{t('common.home')}</Link><span>/</span><span>{t('nav.news')}</span>
          </div>
          <div className="section-label animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>{t('news.page_label')}</div>
          <h1 className={`${styles.heroTitle} animate-fade-in-up`} style={{ animationDelay: '200ms', opacity: 0 }}>
            {t('news.page_title_1')} <span className="text-gradient-gold">{t('news.page_title_2')}</span>
          </h1>
          <p className={`${styles.heroSub} animate-fade-in-up`} style={{ animationDelay: '330ms', opacity: 0 }}>
            {t('news.page_subtitle')}
          </p>
        </div>
      </section>

      <div className="container">
        {/* Featured Article */}
        <AnimateOnScroll>
          <section className={styles.featuredSection}>
            <div className={styles.featuredLabel}>{t('news.featured')}</div>
            <div className={`${styles.featuredCard} glass-card`} id="news-featured-article">
              <div className={styles.featuredImg} aria-hidden="true">
                <div className={styles.featuredImgInner} />
              </div>
              <div className={styles.featuredContent}>
                <div className={styles.featuredMeta}>
                  <span className={styles.category} style={{ color: featuredColor, borderColor: `${featuredColor}40`, background: `${featuredColor}15` }}>
                    {featured.type === 'news' ? t('news.type_news') : t('news.type_event')}
                  </span>
                  <span className={styles.metaDot} />
                  <span className={styles.metaText}>{formatDate(featured.published_at)}</span>
                </div>
                <h2 className={styles.featuredTitle}>{featured.title}</h2>
                <p className={styles.featuredExcerpt}>{featured.summary}</p>
                <div className={styles.featuredAuthor}>
                  <div className={styles.authorAvatar} style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)', borderColor: 'rgba(212,175,55,0.3)' }}>
                    {featured.author[0]}
                  </div>
                  <div>
                    <div className={styles.authorName}>{featured.author}</div>
                    <div className={styles.authorRole}>{featured.type === 'news' ? (locale === 'ar' ? 'كاتب' : 'Author') : (locale === 'ar' ? 'منظم' : 'Organizer')}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </AnimateOnScroll>

        {/* News Grid */}
        <section className={styles.gridSection}>
          <AnimateOnScroll>
            <div className={styles.gridHeader}>
              <h2 className={styles.gridTitle}>{locale === 'ar' ? 'جميع المقالات' : 'All Articles'}</h2>
              <div className={styles.filterRow}>
                {filterTypes.map((f) => (
                  <button
                    key={f.key}
                    className={`${styles.filterBtn} ${activeFilter === f.key ? styles.filterActive : ''}`}
                    aria-pressed={activeFilter === f.key}
                    id={`news-filter-${f.key.toLowerCase()}`}
                    onClick={() => setActiveFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </AnimateOnScroll>

          <div className={styles.grid}>
            {filteredArticles.map((a, i) => {
              const color = TYPE_COLORS[a.type] || 'var(--gold)';
              return (
                <AnimateOnScroll key={a.id} delay={i * 80}>
                  <article className={`${styles.articleCard} glass-card`} id={`news-article-${a.id}`}>
                    <div className={styles.cardTopBar} style={{ background: color }} aria-hidden="true" />
                    <div className={styles.cardBody}>
                      <div className={styles.cardMeta}>
                        <span className={styles.category} style={{ color, borderColor: `${color}40`, background: `${color}15` }}>
                          {a.type === 'news' ? t('news.type_news') : t('news.type_event')}
                        </span>
                        <span className={styles.metaText}>{formatDate(a.published_at)}</span>
                      </div>
                      <h3 className={styles.cardTitle}>{a.title}</h3>
                      <p className={styles.cardExcerpt}>{a.summary}</p>
                      <div className={styles.cardFooter}>
                        <span className={styles.cardAuthor}>{a.author}</span>
                        <span className={styles.readMore} style={{ color }}>{t('news.read_more')}</span>
                      </div>
                    </div>
                  </article>
                </AnimateOnScroll>
              );
            })}
          </div>

          {filteredArticles.length === 0 && (
            <AnimateOnScroll>
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                {locale === 'ar' ? 'لا توجد مقالات في هذه الفئة.' : 'No articles in this category.'}{' '}
                <button onClick={() => setActiveFilter('All')} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                  {locale === 'ar' ? 'عرض الكل' : 'Show all'}
                </button>
              </div>
            </AnimateOnScroll>
          )}
        </section>
      </div>
    </div>
  );
}
