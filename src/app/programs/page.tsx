import type { Metadata } from 'next';
import Link from 'next/link';
import { readFile } from 'fs/promises';
import path from 'path';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import Footer from '@/components/Footer';
import styles from './programs.module.css';
import { t } from '@/lib/translations';
import { getLocale } from '@/lib/getLocale';

async function getSettings() {
  const file = path.join(process.cwd(), 'src', 'data', 'site-settings.json');
  const raw = await readFile(file, 'utf-8');
  return JSON.parse(raw);
}

export const metadata: Metadata = {
  title: 'Programs — Alfarabi University AI Engineering',
  description: 'Explore BSc, MSc, and PhD programs in Artificial Intelligence Engineering at Al-Farabi University, Baghdad, Iraq.',
};

const programs = [
  {
    id: 'bsc-ai',
    level: "Bachelor's",
    name: 'BSc in AI Engineering',
    duration: '4 years · 240 credits',
    color: 'var(--gold)',
    description: 'A rigorous four-year program covering the full spectrum of artificial intelligence — from mathematical foundations to deployment-ready systems.',
    courses: ['Neural Networks', 'Computer Vision', 'NLP', 'Robotics', 'ML Ops', 'AI Ethics'],
    icon: '🎓',
    featured: true,
  },
  {
    id: 'msc-ai',
    level: "Master's",
    name: 'MSc in Artificial Intelligence',
    duration: '2 years · 120 credits',
    color: 'var(--crimson-light)',
    description: 'An advanced research-oriented program for graduates seeking specialization in AI research, industry leadership, or doctoral preparation.',
    courses: ['Advanced Deep Learning', 'Generative AI', 'Agentic Systems', 'AI Safety', 'Research Methods'],
    icon: '🔬',
    featured: false,
  },
  {
    id: 'phd-ai',
    level: 'Doctoral',
    name: 'PhD in AI Research',
    duration: '3–4 years · Research',
    color: '#a78bfa',
    description: 'A fully research-focused doctoral program, supervised by leading professors, aimed at producing impactful contributions to the global AI literature.',
    courses: ['Independent Research', 'Seminar Series', 'Academic Publication', 'International Collaboration'],
    icon: '⚗️',
    featured: false,
  },
  {
    id: 'cert-ml',
    level: 'Certificate',
    name: 'Professional ML Certificate',
    duration: '6 months · 30 credits',
    color: '#4ade80',
    description: 'An intensive short-course for working professionals looking to upskill in machine learning, data science, and practical AI deployment.',
    courses: ['Python & Data Science', 'Supervised Learning', 'Deep Learning Intro', 'Cloud ML APIs'],
    icon: '📜',
    featured: false,
  },
  {
    id: 'exchange',
    level: 'Exchange',
    name: 'International AI Exchange',
    duration: '1 semester · Partner Unis',
    color: '#7eb3f9',
    description: 'Study abroad with one of our partner universities through international exchange programs. Open to 2nd–4th year students.',
    courses: ['Partner University Courses', 'Language Prep', 'Cultural Studies'],
    icon: '✈️',
    featured: false,
  },
  {
    id: 'summer-ai',
    level: 'Summer',
    name: 'AI Engineering Summer School',
    duration: '8 weeks · Intensive',
    color: '#fb923c',
    description: 'An intensive 8-week summer program offering hands-on AI project work, mentorship from industry professionals, and networking events.',
    courses: ['LLM Fine-tuning', 'CV Projects', 'Hackathon Week', 'Industry Mentorship'],
    icon: '☀️',
    featured: false,
  },
];

const requirements = {
  bsc: [
    'High school diploma with strong Math & Physics grades',
    'National entrance exam score meeting minimum threshold',
    'English proficiency: IELTS 5.5 / TOEFL 65 or equivalent',
    'Letter of motivation (500–700 words)',
    'Optional: Olympiad awards in Math, Physics, or CS are a strong advantage',
  ],
  msc: [
    "Bachelor's degree in Engineering, Computer Science, or Mathematics (GPA ≥ 3.0)",
    'English proficiency: IELTS 6.5 / TOEFL 85 or equivalent',
    'Two academic letters of recommendation',
    'Research statement (1,000–1,500 words) outlining your AI research interests',
    'Portfolio of relevant projects or publications (optional but valued)',
  ],
};

export default async function ProgramsPage() {
  const locale = await getLocale();
  const s = await getSettings();

  const highlights = [
    { label: locale === 'ar' ? 'اعتماد البرنامج' : 'Program Accreditation', val: locale === 'ar' ? 'وزارة التعليم العراقية' : 'Iraqi Ministry of Education' },
    { label: locale === 'ar' ? 'لغة التدريس' : 'Language of Instruction', val: locale === 'ar' ? 'الإنجليزية والعربية' : 'English & Arabic' },
    { label: locale === 'ar' ? 'مراكز البحث' : 'Research Centers', val: locale === 'ar' ? `${s.research_labs ?? 5} مختبرات نشطة` : `${s.research_labs ?? 5} Active Labs` },
    { label: locale === 'ar' ? 'شركاء الصناعة' : 'Industry Partners', val: locale === 'ar' ? `+${s.industry_partners ?? 60} شركة` : `${s.industry_partners ?? 60}+ Companies` },
  ];

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className="orb" style={{ width: 300, height: 300, top: '5%', right: '5%', background: 'rgba(212,175,55,0.07)' }} aria-hidden="true" />
        <div className="orb orb-slow" style={{ width: 200, height: 200, bottom: '15%', left: '3%', background: 'rgba(165,28,48,0.06)' }} aria-hidden="true" />
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.breadcrumb}>
            <Link href="/">{t('common.home', locale)}</Link><span>/</span><span>{t('common.programs', locale)}</span>
          </div>
          <div className="section-label animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>{t('programs.label', locale)}</div>
          <h1 className={`${styles.heroTitle} animate-fade-in-up`} style={{ animationDelay: '200ms', opacity: 0 }}>
            {t('programs.hero_title_1', locale)} <span className="text-gradient-gold">{t('programs.hero_title_2', locale)}</span>
          </h1>
          <p className={`${styles.heroSub} animate-fade-in-up`} style={{ animationDelay: '330ms', opacity: 0 }}>
            {t('programs.hero_sub', locale)}
          </p>
        </div>
      </section>

      {/* ── Feature Strip ── */}
      <div className={styles.featStrip}>
        {[
          { num: String(s.degree_levels ?? 4), label: t('programs.degree_levels', locale) },
          { num: `${s.exchange_partners ?? 20}+`, label: t('programs.erasmus_partners', locale) },
          { num: `${s.published_papers ?? 200}+`, label: t('programs.published_papers', locale) },
          { num: `${s.grad_employment ?? 94}%`, label: t('programs.grad_employment', locale) },
        ].map((f) => (
          <div key={f.label} className={styles.featItem}>
            <span className={styles.featNum}>{f.num}</span>
            <span className={styles.featLabel}>{f.label}</span>
          </div>
        ))}
      </div>

      <div className="container">
        {/* ── Featured BSc Banner ── */}
        <section className={styles.section} aria-labelledby="flagship-heading">
          <div className={styles.sectionHeader}>
            <div className="section-label">{t('programs.flagship', locale)}</div>
            <h2 id="flagship-heading" className={styles.sectionTitle}>
              {s.flagship_heading || (locale === 'ar' ? 'بكالوريوس هندسة الذكاء الاصطناعي' : 'Bachelor of Science in AI Engineering')}
            </h2>
          </div>

          <div className={styles.featuredBanner}>
            <div className={styles.bannerBg} aria-hidden="true" />
            <div className={styles.bannerLeft}>
              <div className={styles.bannerBadge}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {locale === 'ar' ? `الأكثر شعبية · +${(s.total_graduates ?? 8000).toLocaleString()} خريج` : `Most Popular · ${(s.total_graduates ?? 8000).toLocaleString()}+ Graduates`}
              </div>
              <h3 className={styles.bannerTitle}>
                {s.flagship_title || 'Shape the Future of'}{' '}
                <span className="text-gradient-gold">{s.flagship_title_accent || 'Artificial Intelligence'}</span>
              </h3>
              <p className={styles.bannerDesc}>
                {s.flagship_desc || 'Our flagship program offers a transformative 4-year journey through the complete landscape of AI Engineering — from linear algebra and probability to deploying production-grade neural networks and multi-agent systems.'}
              </p>
              <div className={styles.bannerHighlights}>
                {(s.flagship_highlights
                  ? s.flagship_highlights.split(',').map((h: string) => h.trim())
                  : ['240 ECTS Credits', '4 Year Duration', 'Industry Projects', 'Research Track Available', 'English Medium', 'Scholarship Eligible']
                ).map((h: string) => (
                  <div key={h} className={styles.highlight}>
                    <span className={styles.highlightDot} />
                    {h}
                  </div>
                ))}
              </div>
              <div className={styles.bannerActions}>
                <Link href="/register" className="btn-primary" id="programs-bsc-apply-btn">{t('programs.apply_now', locale)}</Link>
                <Link href="/classes" className="btn-gold" id="programs-bsc-classes-btn">{t('programs.view_cohorts', locale)}</Link>
              </div>
            </div>

            <div className={styles.bannerRight}>
              {[
                { icon: '📚', num: String(s.total_courses ?? 42), label: locale === 'ar' ? 'إجمالي المقررات' : 'Total Courses', color: 'rgba(212,175,55,0.15)' },
                { icon: '🧪', num: String(s.research_labs ?? 5), label: locale === 'ar' ? 'مختبرات بحثية' : 'Research Labs', color: 'rgba(165,28,48,0.15)' },
                { icon: '🏆', num: `${s.employment_rate ?? 92}%`, label: locale === 'ar' ? 'معدل التوظيف' : 'Employment Rate', color: 'rgba(167,139,250,0.15)' },
                { icon: '🌍', num: `${s.exchange_partners ?? 20}+`, label: locale === 'ar' ? 'شركاء تبادل' : 'Exchange Partners', color: 'rgba(126,179,249,0.15)' },
              ].map((s) => (
                <div key={s.label} className={styles.bannerStatCard}>
                  <div className={styles.bannerStatIcon} style={{ background: s.color }}>
                    <span style={{ fontSize: '1.1rem' }} aria-hidden="true">{s.icon}</span>
                  </div>
                  <div>
                    <div className={styles.bannerStatNum}>{s.num}</div>
                    <div className={styles.bannerStatLabel}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── All Programs Grid ── */}
        <section className={styles.section} aria-labelledby="all-programs-heading">
          <div className={styles.sectionHeader}>
            <div className="section-label">{t('programs.all_label', locale)}</div>
            <h2 id="all-programs-heading" className={styles.sectionTitle}>
              {t('programs.choose_path', locale)} <span className="text-gradient-gold">{t('programs.choose_path_accent', locale)}</span>
            </h2>
            <p className={styles.sectionSub}>{t('programs.choose_sub', locale)}</p>
          </div>

          <div className={styles.grid}>
            {programs.map((prog, i) => (
              <AnimateOnScroll key={prog.id} delay={i * 90}>
                <article className={`${styles.card} glass-card`} id={`programs-card-${prog.id}`}>
                  <div className={styles.cardAccentBar} style={{ background: prog.color }} />
                  <div className={styles.cardBody}>
                    <div className={styles.cardMeta}>
                      <div className={styles.cardIcon} style={{ background: `${prog.color}22` }}>
                        <span style={{ fontSize: '1.3rem' }} aria-hidden="true">{prog.icon}</span>
                      </div>
                      <span className={styles.cardBadge} style={{ color: prog.color, borderColor: `${prog.color}40`, background: `${prog.color}15` }}>
                        {prog.level}
                      </span>
                    </div>
                    <h3 className={styles.cardTitle}>{prog.name}</h3>
                    <p className={styles.cardDesc}>{prog.description}</p>

                    <div className={styles.curriculum}>
                      <span className={styles.curriculumLabel}>{t('programs.key_modules', locale)}</span>
                      <div className={styles.courseChips}>
                        {prog.courses.map((c) => (
                          <span key={c} className={styles.chip}>{c}</span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.cardFoot}>
                      <div className={styles.durationBadge}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {prog.duration}
                      </div>
                      <Link href="/register" className={styles.cardCta} style={{ color: prog.color, borderColor: `${prog.color}50` }} id={`programs-apply-${prog.id}`}>
                        {t('programs.apply', locale)}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </Link>
                    </div>
                  </div>
                </article>
              </AnimateOnScroll>
            ))}
          </div>
        </section>

        {/* ── Program Highlights ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className="section-label">{t('programs.accreditation', locale)}</div>
            <h2 className={styles.sectionTitle}>{t('programs.highlights', locale)} <span className="text-gradient-gold">{t('programs.highlights_accent', locale)}</span></h2>
          </div>
          <div className={styles.featStrip} style={{ borderRadius: '20px', border: '1px solid var(--glass-border)', overflow: 'hidden', marginBottom: 0 }}>
            {highlights.map((h) => (
              <div key={h.label} className={styles.featItem}>
                <span className={styles.featNum} style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{h.val}</span>
                <span className={styles.featLabel}>{h.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Admission Requirements ── */}
        <section className={styles.section} aria-labelledby="requirements-heading">
          <div className={styles.sectionHeader}>
            <div className="section-label">{t('programs.admissions', locale)}</div>
            <h2 id="requirements-heading" className={styles.sectionTitle}>
              {t('programs.entry_req', locale)} <span className="text-gradient-gold">{t('programs.entry_req_accent', locale)}</span>
            </h2>
          </div>

          <div className={styles.reqSection}>
            <div>
              <h3 className={styles.reqTitle}>🎓 {locale === 'ar' ? 'برنامج البكالوريوس' : 'BSc Program'}</h3>
              <ul className={styles.reqList}>
                {requirements.bsc.map((r) => (
                  <li key={r}>
                    <svg className={styles.reqCheck} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={styles.reqTitle}>🔬 {locale === 'ar' ? 'برنامج الماجستير' : 'MSc Program'}</h3>
              <ul className={styles.reqList}>
                {requirements.msc.map((r) => (
                  <li key={r}>
                    <svg className={styles.reqCheck} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
