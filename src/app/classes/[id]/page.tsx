import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import Footer from '@/components/Footer';
import styles from './hub.module.css';

/* ─── Data ────────────────────────────────────────────────────────── */
const classes: Record<string, ClassData> = {
  'ai-2022': {
    id: 'ai-2022',
    cohort: 'Cohort 2022',
    name: 'AI Engineering — Year 4',
    year: 4,
    students: 112,
    rep: { name: 'Amir Seitkali', email: 'a.seitkali@student.kaznu.kz' },
    teachers: [
      { name: 'Dr. Nurlan Bekzhanov', role: 'Lead Professor — Deep Learning', avatar: 'NB' },
      { name: 'Prof. Aliya Dzhaksybekova', role: 'Associate Professor — NLP', avatar: 'AD' },
    ],
    tags: ['Deep Learning', 'NLP', 'Thesis'],
    color: 'gold',
    description: 'Senior cohort completing final-year dissertations and advanced AI research projects. Focus on industry readiness and academic publication.',
    courses: [
      { code: 'AIE-401', name: 'Advanced Deep Learning', credits: 5, type: 'Core' },
      { code: 'AIE-402', name: 'Natural Language Processing', credits: 5, type: 'Core' },
      { code: 'AIE-403', name: 'AI Ethics & Governance', credits: 3, type: 'Elective' },
      { code: 'AIE-499', name: 'Senior Thesis Project', credits: 8, type: 'Thesis' },
    ],
    announcements: [
      { id: 1, date: 'Apr 2, 2026', title: 'Thesis submission deadline extended', body: 'Final thesis submissions are now due April 18th. Please ensure your supervisor has reviewed the latest draft.', priority: 'high' },
      { id: 2, date: 'Mar 28, 2026', title: 'Guest lecture: AI in Healthcare', body: 'Renowned researcher Dr. Kim from MIT visits next Monday, 15:00 in Auditorium A.', priority: 'normal' },
      { id: 3, date: 'Mar 24, 2026', title: 'Project defense schedule posted', body: 'Individual defense slots are available on the academic portal. Book your time by March 31st.', priority: 'normal' },
    ],
    events: [
      { date: 'Apr 5', label: 'Thesis Draft Due', type: 'academic' },
      { date: 'Apr 12', label: 'Guest Lecture — Dr. Kim', type: 'seminar' },
      { date: 'Apr 18', label: 'Final Thesis Submission', type: 'deadline' },
      { date: 'May 2', label: 'Project Defense Week Begins', type: 'academic' },
    ],
    attendanceRate: 94,
    avgGrade: '3.7 GPA',
  },
  'ai-2023': {
    id: 'ai-2023',
    cohort: 'Cohort 2023',
    name: 'AI Engineering — Year 3',
    year: 3,
    students: 134,
    rep: { name: 'Daniyar Akhmetov', email: 'd.akhmetov@student.kaznu.kz' },
    teachers: [
      { name: 'Dr. Sergey Popov', role: 'Lead Professor — Computer Vision', avatar: 'SP' },
      { name: 'Ms. Zhuldyz Tassova', role: 'Lecturer — Robotics', avatar: 'ZT' },
    ],
    tags: ['Computer Vision', 'Robotics', 'ML Ops'],
    color: 'crimson',
    description: 'Third-year students specializing in applied machine learning, computer vision, and robotics engineering pipelines.',
    courses: [
      { code: 'AIE-301', name: 'Computer Vision', credits: 5, type: 'Core' },
      { code: 'AIE-302', name: 'Robotics & Automation', credits: 5, type: 'Core' },
      { code: 'AIE-303', name: 'ML Operations & Deployment', credits: 4, type: 'Core' },
      { code: 'AIE-304', name: 'Data Engineering', credits: 3, type: 'Elective' },
    ],
    announcements: [
      { id: 1, date: 'Apr 1, 2026', title: 'Robotics Lab access hours updated', body: 'Lab hours extended to 22:00 on weekdays until the end of the semester. Badge access required.', priority: 'normal' },
      { id: 2, date: 'Mar 27, 2026', title: 'Alfarabi AI Hackathon — Team registration open', body: 'Register your team of 3-4 for the annual hackathon by April 10th. Prizes worth $5,000.', priority: 'high' },
    ],
    events: [
      { date: 'Apr 10', label: 'Hackathon Team Registration Deadline', type: 'deadline' },
      { date: 'Apr 19', label: 'Alfarabi AI Hackathon 2026', type: 'seminar' },
      { date: 'Apr 25', label: 'Computer Vision Midterm', type: 'academic' },
      { date: 'May 10', label: 'ML Ops Project Demo', type: 'academic' },
    ],
    attendanceRate: 89,
    avgGrade: '3.4 GPA',
  },
  'ai-2024': {
    id: 'ai-2024',
    cohort: 'Cohort 2024',
    name: 'AI Engineering — Year 2',
    year: 2,
    students: 158,
    rep: { name: 'Aigerim Nurmagambetova', email: 'a.nurmagambetova@student.kaznu.kz' },
    teachers: [
      { name: 'Dr. Marat Zhumabayev', role: 'Lead Professor — Algorithms', avatar: 'MZ' },
      { name: 'Dr. Olga Smirnova', role: 'Associate Professor — Linear Algebra', avatar: 'OS' },
    ],
    tags: ['Algorithms', 'Linear Algebra', 'Python'],
    color: 'blue',
    description: 'Second-year students building the mathematical and programming foundations essential for advanced AI coursework.',
    courses: [
      { code: 'AIE-201', name: 'Data Structures & Algorithms', credits: 5, type: 'Core' },
      { code: 'AIE-202', name: 'Linear Algebra for AI', credits: 5, type: 'Core' },
      { code: 'AIE-203', name: 'Probability & Statistics', credits: 4, type: 'Core' },
      { code: 'AIE-204', name: 'Python for Data Science', credits: 3, type: 'Elective' },
    ],
    announcements: [
      { id: 1, date: 'Mar 30, 2026', title: 'Midterm exam schedule released', body: 'Midterm examinations for all Year 2 courses run April 5–9. Check your personal schedule on the portal.', priority: 'high' },
      { id: 2, date: 'Mar 22, 2026', title: 'Python workshop — Pandas & NumPy', body: 'Free optional workshop by the AI club this Saturday, 10:00–14:00, Room 312.', priority: 'normal' },
    ],
    events: [
      { date: 'Apr 5', label: 'Midterm Exams Begin', type: 'deadline' },
      { date: 'Apr 9', label: 'Midterm Exams End', type: 'academic' },
      { date: 'Apr 20', label: 'Algorithm Assignment Due', type: 'deadline' },
      { date: 'May 15', label: 'Final Exams Begin', type: 'academic' },
    ],
    attendanceRate: 91,
    avgGrade: '3.2 GPA',
  },
  'ai-2025': {
    id: 'ai-2025',
    cohort: 'Cohort 2025',
    name: 'AI Engineering — Year 1',
    year: 1,
    students: 180,
    rep: { name: 'To be assigned', email: null },
    teachers: [
      { name: 'Prof. Kanat Bekov', role: 'Lead Professor — Fundamentals', avatar: 'KB' },
      { name: 'Dr. Irina Volkova', role: 'Lecturer — Mathematics', avatar: 'IV' },
    ],
    tags: ['Fundamentals', 'Programming', 'Math'],
    color: 'navy',
    description: 'Newest cohort beginning their journey in AI Engineering. Courses focus on programming fundamentals, discrete mathematics, and introductory AI.',
    courses: [
      { code: 'AIE-101', name: 'Introduction to AI Engineering', credits: 4, type: 'Core' },
      { code: 'AIE-102', name: 'Programming Fundamentals (C++)', credits: 5, type: 'Core' },
      { code: 'AIE-103', name: 'Discrete Mathematics', credits: 5, type: 'Core' },
      { code: 'AIE-104', name: 'Academic Communication', credits: 2, type: 'General' },
    ],
    announcements: [
      { id: 1, date: 'Apr 1, 2026', title: 'Class Representative nominations open', body: 'Nominations for the Cohort 2025 Class Representative are open until April 7th. Submit your candidacy to the department office.', priority: 'high' },
      { id: 2, date: 'Mar 25, 2026', title: 'Welcome week wrap-up & mentorship program', body: 'Thank you for a great first month! Sign up for peer mentorship with Year 3–4 students here.', priority: 'normal' },
    ],
    events: [
      { date: 'Apr 7', label: 'Class Rep Nominations Deadline', type: 'deadline' },
      { date: 'Apr 15', label: 'Programming Assignment 2 Due', type: 'deadline' },
      { date: 'Apr 22', label: 'Introductory AI Seminar', type: 'seminar' },
      { date: 'May 1', label: 'Math Mid-Semester Test', type: 'academic' },
    ],
    attendanceRate: 97,
    avgGrade: '3.1 GPA',
  },
};

/* ─── Types ───────────────────────────────────────────────────────── */
interface ClassData {
  id: string; cohort: string; name: string; year: number;
  students: number;
  rep: { name: string; email: string | null };
  teachers: { name: string; role: string; avatar: string }[];
  tags: string[];
  color: string;
  description: string;
  courses: { code: string; name: string; credits: number; type: string }[];
  announcements: { id: number; date: string; title: string; body: string; priority: string }[];
  events: { date: string; label: string; type: string }[];
  attendanceRate: number;
  avgGrade: string;
}

const colorMap: Record<string, string> = {
  gold: 'var(--gold)',
  crimson: 'var(--crimson-light)',
  blue: '#7eb3f9',
  navy: '#6a78a0',
};

const courseTypeColors: Record<string, string> = {
  Core: 'var(--gold)',
  Elective: 'var(--crimson-light)',
  Thesis: '#a78bfa',
  General: '#6a78a0',
};

const eventTypeColors: Record<string, string> = {
  academic: 'var(--gold)',
  deadline: 'var(--crimson-light)',
  seminar: '#7eb3f9',
};

/* ─── Metadata ────────────────────────────────────────────────────── */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const cls = classes[id];
  if (!cls) return { title: 'Class Not Found' };
  return {
    title: `${cls.name} — Class Hub | Alfarabi University`,
    description: cls.description,
  };
}

export function generateStaticParams() {
  return Object.keys(classes).map((id) => ({ id }));
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default async function ClassHubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cls = classes[id];
  if (!cls) notFound();

  const accent = colorMap[cls.color] || colorMap.gold;

  return (
    <div className={styles.page} style={{ '--accent': accent } as React.CSSProperties}>
      {/* Hero Banner */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroAccentBar} style={{ background: accent }} aria-hidden="true" />
        <div className="orb" style={{ width: 260, height: 260, top: '-30px', right: '5%', background: `${accent}12` }} aria-hidden="true" />
        <div className="container">
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/classes">Classes</Link>
            <span>/</span>
            <span>{cls.cohort}</span>
          </div>

          <div className={styles.heroContent}>
            <AnimateOnScroll direction="left">
              <div className={styles.heroLeft}>
                <div className={styles.yearBadge} style={{ background: `${accent}22`, borderColor: `${accent}55`, color: accent }}>
                  Year {cls.year} · {cls.cohort}
                </div>
                <h1 className={styles.heroTitle}>{cls.name}</h1>
                <p className={styles.heroDesc}>{cls.description}</p>
                <div className={styles.heroTags}>
                  {cls.tags.map((t) => (
                    <span key={t} className={styles.heroTag} style={{ borderColor: accent, color: accent }}>{t}</span>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll direction="right">
              <div className={styles.heroStats}>
                <div className={styles.heroStatCard} style={{ borderColor: `${accent}40` }}>
                  <span className={styles.heroStatNum} style={{ color: accent }}>{cls.students}</span>
                  <span className={styles.heroStatLabel}>Enrolled Students</span>
                </div>
                <div className={styles.heroStatCard} style={{ borderColor: `${accent}40` }}>
                  <span className={styles.heroStatNum} style={{ color: accent }}>{cls.attendanceRate}%</span>
                  <span className={styles.heroStatLabel}>Attendance Rate</span>
                </div>
                <div className={styles.heroStatCard} style={{ borderColor: `${accent}40` }}>
                  <span className={styles.heroStatNum} style={{ color: accent }}>{cls.avgGrade}</span>
                  <span className={styles.heroStatLabel}>Avg. Grade</span>
                </div>
                <div className={styles.heroStatCard} style={{ borderColor: `${accent}40` }}>
                  <span className={styles.heroStatNum} style={{ color: accent }}>{cls.courses.length}</span>
                  <span className={styles.heroStatLabel}>Active Courses</span>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="container">
        <div className={styles.mainGrid}>

          {/* ── Left Column ── */}
          <div className={styles.leftCol}>

            {/* Announcements */}
            <section className={styles.card} aria-labelledby="announcements-heading">
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                  <h2 id="announcements-heading" className={styles.cardTitle}>Announcements</h2>
                </div>
                <span className={styles.cardBadge} style={{ background: `${accent}20`, color: accent, borderColor: `${accent}40` }}>
                  {cls.announcements.length} new
                </span>
              </div>
              <div className={styles.announcementList}>
                {cls.announcements.map((a, idx) => (
                  <AnimateOnScroll key={a.id} delay={idx * 80}>
                    <div className={`${styles.announcement} ${a.priority === 'high' ? styles.announcementHigh : ''}`}>
                      {a.priority === 'high' && (
                        <div className={styles.urgentBadge} style={{ background: 'rgba(165, 28, 48, 0.15)', color: 'var(--crimson-light)', borderColor: 'rgba(165, 28, 48, 0.25)' }}>
                          Urgent
                        </div>
                      )}
                      <div className={styles.announcementDate}>{a.date}</div>
                      <h3 className={styles.announcementTitle}>{a.title}</h3>
                      <p className={styles.announcementBody}>{a.body}</p>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </section>

            {/* Courses */}
            <section className={styles.card} aria-labelledby="courses-heading">
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                  <h2 id="courses-heading" className={styles.cardTitle}>Current Courses</h2>
                </div>
                <span className={styles.totalCredits} style={{ color: accent }}>
                  {cls.courses.reduce((s, c) => s + c.credits, 0)} credits total
                </span>
              </div>
              <div className={styles.courseList}>
                {cls.courses.map((course) => (
                  <div key={course.code} className={styles.courseRow}>
                    <div className={styles.courseLeft}>
                      <span className={styles.courseCode} style={{ color: accent }}>{course.code}</span>
                      <span className={styles.courseName}>{course.name}</span>
                    </div>
                    <div className={styles.courseRight}>
                      <span className={styles.courseType} style={{ color: courseTypeColors[course.type] || accent, borderColor: `${courseTypeColors[course.type] || accent}40` }}>
                        {course.type}
                      </span>
                      <span className={styles.courseCredits}>{course.credits} cr</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right Column ── */}
          <div className={styles.rightCol}>

            {/* Faculty */}
            <section className={styles.card} aria-labelledby="faculty-heading">
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                  <h2 id="faculty-heading" className={styles.cardTitle}>Faculty</h2>
                </div>
              </div>
              <div className={styles.facultyList}>
                {cls.teachers.map((t) => (
                  <div key={t.name} className={styles.facultyItem}>
                    <div className={styles.facultyAvatar} style={{ background: `${accent}20`, borderColor: `${accent}40`, color: accent }}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className={styles.facultyName}>{t.name}</div>
                      <div className={styles.facultyRole}>{t.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Class Rep */}
            <section className={styles.card} aria-labelledby="rep-heading">
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <h2 id="rep-heading" className={styles.cardTitle}>Class Representative</h2>
                </div>
              </div>
              {cls.rep.name !== 'To be assigned' ? (
                <div className={styles.repCard} style={{ borderColor: `${accent}30` }}>
                  <div className={styles.repAvatar} style={{ background: `${accent}20`, borderColor: `${accent}40`, color: accent }}>
                    {cls.rep.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className={styles.repInfo}>
                    <div className={styles.repName}>{cls.rep.name}</div>
                    <div className={styles.repRole}>Class Representative</div>
                    {cls.rep.email && (
                      <a href={`mailto:${cls.rep.email}`} className={styles.repEmail} style={{ color: accent }}>
                        {cls.rep.email}
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.noRep}>
                  <p>No representative has been assigned yet. Nominations are open.</p>
                </div>
              )}
            </section>

            {/* Upcoming Events */}
            <section className={styles.card} aria-labelledby="events-heading">
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <h2 id="events-heading" className={styles.cardTitle}>Class Schedule</h2>
                </div>
                <Link href="/calendar" className={styles.viewAllLink} style={{ color: accent }}>View all →</Link>
              </div>
              <div className={styles.eventList}>
                {cls.events.map((ev, i) => {
                  const color = eventTypeColors[ev.type] || accent;
                  return (
                    <div key={i} className={styles.eventRow}>
                      <div className={styles.eventDate} style={{ background: `${color}15`, color, borderColor: `${color}30` }}>
                        {ev.date}
                      </div>
                      <div className={styles.eventInfo}>
                        <span className={styles.eventLabel}>{ev.label}</span>
                        <span className={styles.eventType} style={{ color }}>{ev.type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
