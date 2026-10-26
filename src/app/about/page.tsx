import type { Metadata } from 'next';
import Link from 'next/link';
import { readFile } from 'fs/promises';
import path from 'path';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import Footer from '@/components/Footer';
import styles from './about.module.css';
import { t } from '@/lib/translations';
import { getLocale } from '@/lib/getLocale';

export const metadata: Metadata = {
  title: 'About — Alfarabi University AI Engineering Department',
  description: 'Learn about the AI Engineering department at Al-Farabi University in Baghdad, Iraq — our mission, faculty, history, and values.',
};

interface SiteSettings {
  site_name: string;
  department_name: string;
  city: string;
  country: string;
  contact_email: string;
  phone: string;
  founded_year?: number;
  total_students?: number;
  research_papers?: number;
}

async function getSettings(): Promise<SiteSettings> {
  const file = path.join(process.cwd(), 'src', 'data', 'site-settings.json');
  const raw = await readFile(file, 'utf-8');
  return JSON.parse(raw);
}

export default async function AboutPage() {
  const s = await getSettings();
  const locale = await getLocale();

  const foundedYear = s.founded_year || 0;
  const yearsActive = foundedYear ? new Date().getFullYear() - foundedYear : 0;
  const totalStudents = s.total_students || 0;

  // Faculty and milestones are intentionally empty — admin adds them via dashboard
  const faculty: { name: string; role: string; avatar: string; accent: string; expertise: string[] }[] = [];
  const milestones: { year: string; label: string; desc: string }[] = [];

  const values = [
    { icon: '🔬', title: t('about.value_research', locale), desc: t('about.value_research_desc', locale) },
    { icon: '🤝', title: t('about.value_community', locale), desc: t('about.value_community_desc', locale) },
    { icon: '🌱', title: t('about.value_industry', locale), desc: t('about.value_industry_desc', locale) },
    { icon: '🧠', title: t('about.value_ethics', locale), desc: t('about.value_ethics_desc', locale) },
  ];

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className="orb" style={{ width: 350, height: 350, top: '0%', right: '0%', background: 'rgba(165,28,48,0.07)' }} aria-hidden="true" />
        <div className="orb orb-slow" style={{ width: 220, height: 220, bottom: '10%', left: '5%', background: 'rgba(212,175,55,0.05)' }} aria-hidden="true" />
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.breadcrumb}>
            <Link href="/">{t('common.home', locale)}</Link><span>/</span><span>{t('common.about', locale)}</span>
          </div>
          <div className="section-label animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>{t('about.label', locale)}</div>
          <h1 className={`${styles.heroTitle} animate-fade-in-up`} style={{ animationDelay: '200ms', opacity: 0 }}>
            {t('about.hero_title_1', locale)}<br />
            <span className="text-gradient-gold">{t('about.hero_title_2', locale)}</span>
          </h1>
          <p className={`${styles.heroSub} animate-fade-in-up`} style={{ animationDelay: '330ms', opacity: 0 }}>
            {t('about.hero_sub', locale)}
          </p>
          <div className={`${styles.heroStats} animate-fade-in-up`} style={{ animationDelay: '440ms', opacity: 0 }}>
            {[
              [foundedYear ? String(foundedYear) : '—', t('about.founded', locale)],
              [totalStudents ? String(totalStudents) : '—', t('about.students', locale)],
              ['—', t('about.faculty_label', locale)],
              [s.research_papers ? `${s.research_papers}+` : '—', t('about.papers', locale)],
            ].map(([n, l]) => (
              <div key={l} className={styles.heroStat}>
                <span className={styles.heroStatNum}>{n}</span>
                <span className={styles.heroStatLabel}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        {/* Mission */}
        <section className={styles.missionSection}>
          <div className={styles.missionGrid}>
            <AnimateOnScroll direction="left">
              <div>
                <div className="section-label">{t('about.mission_label', locale)}</div>
                <h2 className={styles.sectionTitle}>
                  {(s as any).mission_title || t('about.mission_title', locale)} <span className="text-gradient-gold">{(s as any).mission_title_accent || t('about.mission_title_accent', locale)}</span>
                </h2>
                <p className={styles.bodyText}>{(s as any).mission_p1 || t('about.mission_p1', locale)}</p>
                <p className={styles.bodyText}>{(s as any).mission_p2 || t('about.mission_p2', locale)}</p>
                <Link href="/register" className="btn-gold" style={{ marginTop: '8px', display: 'inline-flex' }}>
                  {t('about.join_dept', locale)}
                </Link>
              </div>
            </AnimateOnScroll>
            <div className={styles.missionValues}>
              {values.map((v, i) => (
                <AnimateOnScroll key={v.title} delay={i * 80} direction="right">
                  <div className={`${styles.valueCard} glass-card`}>
                    <span className={styles.valueIcon}>{v.icon}</span>
                    <div>
                      <div className={styles.valueTitle}>{v.title}</div>
                      <div className={styles.valueDesc}>{v.desc}</div>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* History Timeline */}
        <section className={styles.timelineSection}>
          <AnimateOnScroll>
            <div className="section-label">{t('about.history_label', locale)}</div>
            <h2 className={styles.sectionTitle}>{yearsActive} {t('about.history_title_prefix', locale)} <span className="text-gradient-gold">{t('about.history_title_accent', locale)}</span></h2>
          </AnimateOnScroll>
          <div className={styles.timeline}>
            {milestones.map((m, i) => (
              <AnimateOnScroll key={m.year} delay={i * 100} direction={i % 2 === 0 ? 'left' : 'right'}>
                <div className={`${styles.milestoneItem} ${i % 2 === 0 ? styles.milestoneLeft : styles.milestoneRight}`}>
                  <div className={styles.milestoneCard}>
                    <span className={styles.milestoneYear}>{m.year}</span>
                    <h3 className={styles.milestoneLabel}>{m.label}</h3>
                    <p className={styles.milestoneDesc}>{m.desc}</p>
                  </div>
                  <div className={styles.milestoneDot} aria-hidden="true" />
                </div>
              </AnimateOnScroll>
            ))}
            <div className={styles.timelineLine} aria-hidden="true" />
          </div>
        </section>

        {/* Faculty */}
        <section className={styles.facultySection}>
          <AnimateOnScroll>
            <div className="section-label">{t('about.faculty_section_label', locale)}</div>
            <h2 className={styles.sectionTitle}>{t('about.faculty_section_title', locale)} <span className="text-gradient-gold">{t('about.faculty_section_accent', locale)}</span></h2>
          </AnimateOnScroll>
          <div className={styles.facultyGrid}>
            {faculty.map((f, i) => (
              <AnimateOnScroll key={f.name} delay={i * 70}>
                <div className={`${styles.facultyCard} glass-card`}>
                  <div className={styles.facultyAvatar} style={{ background: `${f.accent}18`, borderColor: `${f.accent}40`, color: f.accent }}>
                    {f.avatar}
                  </div>
                  <div className={styles.facultyInfo}>
                    <div className={styles.facultyName}>{f.name}</div>
                    <div className={styles.facultyRole}>{f.role}</div>
                    <div className={styles.facultyTags}>
                      {f.expertise.map((e) => (
                        <span key={e} className={styles.expertTag} style={{ borderColor: `${f.accent}35`, color: f.accent }}>{e}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <AnimateOnScroll>
          <div className={styles.contactCta}>
            <div>
              <h2 className={styles.ctaTitle}>{t('about.contact_title', locale)}</h2>
              <p className={styles.ctaDesc}>
                {[s.city, s.country].filter(Boolean).join(', ') || '—'}
                {(s.contact_email || s.phone) && <br />}
                {[s.contact_email, s.phone].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className={styles.ctaBtns}>
              <Link href="/register" className="btn-primary" id="about-cta-register">{t('about.join_us', locale)}</Link>
              <a href={`mailto:${s.contact_email}`} className="btn-gold" id="about-cta-email">{t('about.send_email', locale)}</a>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
      <Footer />
    </div>
  );
}
