import { readFile } from 'fs/promises';
import path from 'path';
import styles from './StatsSection.module.css';
import { t } from '@/lib/translations';
import { getLocale } from '@/lib/getLocale';

interface SiteSettings {
  site_name: string;
  department_name: string;
  city: string;
  country: string;
  founded_year?: number;
  total_students?: number;
  research_papers?: number;
}

async function getSettings(): Promise<SiteSettings> {
  const file = path.join(process.cwd(), 'src', 'data', 'site-settings.json');
  const raw = await readFile(file, 'utf-8');
  return JSON.parse(raw);
}

export default async function StatsSection() {
  const s = await getSettings();
  const locale = await getLocale();

  const foundedYear = s.founded_year || 0;
  const yearsActive = foundedYear ? new Date().getFullYear() - foundedYear : 0;
  const totalStudents = s.total_students || 0;
  const researchPapers = s.research_papers || 0;

  const stats = [
    {
      icon: '🎓',
      value: totalStudents ? `${(totalStudents / 1000).toFixed(0)}K+` : '—',
      label: t('stats.enrolled', locale),
      desc: t('stats.enrolled_desc', locale),
    },
    {
      icon: '🧬',
      value: researchPapers ? `${researchPapers}+` : '—',
      label: t('stats.papers', locale),
      desc: t('stats.papers_desc', locale),
    },
    {
      icon: '🏛️',
      value: yearsActive ? String(yearsActive) : '—',
      label: t('stats.years', locale),
      desc: foundedYear ? `${t('stats.years_desc_prefix', locale)} ${foundedYear}` : '',
    },
    {
      icon: '🤖',
      value: (s as any).ai_specializations ? `${(s as any).ai_specializations}+` : '15+',
      label: t('stats.specializations', locale),
      desc: t('stats.specializations_desc', locale),
    },
    {
      icon: '🌍',
      value: (s as any).partner_universities ? `${(s as any).partner_universities}+` : '20+',
      label: t('stats.partners', locale),
      desc: t('stats.partners_desc', locale),
    },
    {
      icon: '🏆',
      value: (s as any).dept_ranking || '#1',
      label: t('stats.top_dept', locale),
      desc: s.city ? `${t('stats.top_dept_desc_prefix', locale)} ${s.city}` : t('stats.top_dept', locale),
    },
  ];

  return (
    <section className={styles.section} id="stats" aria-label="University statistics">
      <div className={styles.container}>
        <div className={styles.grid} role="list">
          {stats.map((st) => (
            <div key={st.label} className={`${styles.card} glass-card`} role="listitem">
              <div className={styles.icon} aria-hidden="true">{st.icon}</div>
              <div className={styles.value}>{st.value}</div>
              <div className={styles.label}>{st.label}</div>
              <div className={styles.desc}>{st.desc}</div>
              <div className={styles.glow} aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
