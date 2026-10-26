'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import styles from './owner.module.css';

// ── Types ──────────────────────────────────────────────────────────────
interface SiteSettings {
  site_name: string;
  department_name: string;
  city: string;
  country: string;
  contact_email: string;
  phone: string;
  logo_url: string;
  description: string;
  hero_title: string;
  hero_subtitle: string;
  founded_year: number;
  total_students: number;
  research_papers: number;
  social_telegram: string;
  social_instagram: string;
  social_linkedin: string;
  social_youtube: string;
  social_twitter: string;
  social_facebook: string;
  updated_at: string;
  [key: string]: any;
}

interface Article {
  id: string;
  type: 'news' | 'event';
  title: string;
  summary: string;
  author: string;
  published_at: string;
  status: 'published' | 'draft';
  event_date?: string;
  category?: string;
  location?: string;
  time?: string;
  cohort?: string;
}

interface Cohort {
  id: string;
  year: number;
  title: string;
  description: string;
  rep_name: string;
  rep_email: string;
  student_count: number;
  status: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  student_name: string;
  cohort: string;
  tags: string[];
  github_url: string;
  demo_url: string;
  status: 'approved' | 'pending' | 'rejected';
  submitted_at: string;
}

type SideSection = 'Dashboard' | 'Admin Password' | 'News & Articles' | 'Events & Calendar' | 'Classes & Cohorts' | 'Student Projects' | 'Site Settings';

const sideItems: { label: SideSection; icon: string; section: string }[] = [
  { label: 'Dashboard', icon: '▦', section: 'Overview' },
  { label: 'Admin Password', icon: '🔐', section: 'Owner Controls' },
  { label: 'News & Articles', icon: '📰', section: 'Content' },
  { label: 'Events & Calendar', icon: '📅', section: 'Content' },
  { label: 'Classes & Cohorts', icon: '🏫', section: 'Content' },
  { label: 'Student Projects', icon: '🎓', section: 'Content' },
  { label: 'Site Settings', icon: '⚙️', section: 'Configuration' },
];

// ── Helpers ────────────────────────────────────────────────────────────
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

async function fetchData<T>(file: string): Promise<T> {
  const res = await fetch(`/api/cms?file=${file}`);
  if (!res.ok) throw new Error(`Failed to load ${file}`);
  return res.json();
}

async function saveData(file: string, data: unknown) {
  const res = await fetch(`/api/cms?file=${file}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save');
}

// ── Inline Form Components ─────────────────────────────────────────────
function FormRow({ children }: { children: React.ReactNode }) {
  return <div className={styles.formGrid}>{children}</div>;
}

function Field({ id, label, value, onChange, type = 'text', full = false, placeholder = '' }: {
  id: string; label: string; value: string | number; onChange: (v: string) => void; type?: string; full?: boolean; placeholder?: string;
}) {
  return (
    <div className={`${styles.formGroup} ${full ? styles.full : ''}`}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      {type === 'textarea' ? (
        <textarea id={id} className={styles.textarea} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input id={id} type={type} className={styles.input} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, [string, string]> = {
    published: ['rgba(74,222,128,0.15)', '#4ade80'],
    draft: ['rgba(251,146,60,0.15)', '#fb923c'],
    active: ['rgba(74,222,128,0.15)', '#4ade80'],
    inactive: ['rgba(106,120,160,0.2)', '#6a78a0'],
    approved: ['rgba(74,222,128,0.15)', '#4ade80'],
    pending: ['rgba(251,146,60,0.15)', '#fb923c'],
    rejected: ['rgba(165,28,48,0.15)', 'var(--crimson-light)'],
  };
  const [bg, fg] = colors[status] ?? colors.draft;
  return <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px', background: bg, color: fg }}>{status}</span>;
}

function Toast({ msg }: { msg: { type: 'success' | 'error'; text: string } }) {
  return (
    <div style={{
      padding: '10px 16px', borderRadius: '8px', marginBottom: '16px',
      background: msg.type === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(165,28,48,0.1)',
      color: msg.type === 'success' ? '#4ade80' : 'var(--crimson-light)',
      border: `1px solid ${msg.type === 'success' ? 'rgba(74,222,128,0.3)' : 'rgba(165,28,48,0.3)'}`,
      fontSize: '0.85rem',
    }}>
      {msg.text}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
export default function OwnerPage() {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState<SideSection>('Dashboard');

  // Data
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // UI state
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<string | null>(null);

  // Modal/form state
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [showCohortForm, setShowCohortForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);

  // Load data
  useEffect(() => {
    fetchData<SiteSettings>('site-settings').then(setSettings).catch(console.error);
    fetchData<Article[]>('articles').then(setArticles).catch(console.error);
    fetchData<Cohort[]>('cohorts').then(setCohorts).catch(console.error);
    fetchData<Project[]>('projects').then(setProjects).catch(console.error);
  }, []);

  function flash(type: 'success' | 'error', text: string) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Generic save wrapper ──
  async function persist<T>(file: string, data: T, setter: (d: T) => void, label: string) {
    setSaving(true);
    try {
      await saveData(file, data);
      setter(data);
      flash('success', `${label} saved successfully!`);
    } catch {
      flash('error', `Failed to save ${label.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  }

  // ── Password Change ──
  async function handleChangePassword() {
    if (!newPassword.trim()) {
      flash('error', 'Please enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      flash('error', 'Passwords do not match.');
      return;
    }
    if (newPassword.trim().length < 4) {
      flash('error', 'Password must be at least 4 characters.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/owner/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPassword.trim() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      flash('success', 'Admin password changed successfully! Restart the server for changes to take effect.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      flash('error', err.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  //  ARTICLE CRUD
  // ══════════════════════════════════════════════════════════════════════
  function newArticle(type: 'news' | 'event'): Article {
    return {
      id: uid(), type, title: '', summary: '', author: '',
      published_at: new Date().toISOString().slice(0, 10), status: 'draft',
      ...(type === 'event' ? { event_date: new Date().toISOString().slice(0, 10), category: 'seminar', location: '', time: '', cohort: '' } : {}),
    };
  }

  function openArticleForm(a?: Article, type: 'news' | 'event' = 'news') {
    setEditingArticle(a ?? newArticle(type));
    setShowArticleForm(true);
  }

  async function saveArticle() {
    if (!editingArticle) return;
    if (!editingArticle.title.trim()) { flash('error', 'Title is required.'); return; }
    const exists = articles.find((a) => a.id === editingArticle.id);
    const updated = exists ? articles.map((a) => a.id === editingArticle.id ? editingArticle : a) : [...articles, editingArticle];
    await persist('articles', updated, setArticles, editingArticle.type === 'news' ? 'Article' : 'Event');
    setShowArticleForm(false);
    setEditingArticle(null);
  }

  async function deleteArticle(id: string) {
    if (!confirm('Delete this item permanently?')) return;
    const updated = articles.filter((a) => a.id !== id);
    await persist('articles', updated, setArticles, 'Article');
  }

  async function toggleArticleStatus(id: string) {
    const updated = articles.map((a) =>
      a.id === id ? { ...a, status: a.status === 'published' ? 'draft' as const : 'published' as const } : a
    );
    await persist('articles', updated, setArticles, 'Article status');
  }

  // ══════════════════════════════════════════════════════════════════════
  //  COHORT CRUD
  // ══════════════════════════════════════════════════════════════════════
  function newCohort(): Cohort {
    return { id: uid(), year: new Date().getFullYear(), title: '', description: '', rep_name: '', rep_email: '', student_count: 0, status: 'active' };
  }

  function openCohortForm(c?: Cohort) {
    setEditingCohort(c ?? newCohort());
    setShowCohortForm(true);
  }

  async function saveCohort() {
    if (!editingCohort) return;
    if (!editingCohort.title.trim()) { flash('error', 'Cohort title is required.'); return; }
    const exists = cohorts.find((c) => c.id === editingCohort.id);
    const updated = exists ? cohorts.map((c) => c.id === editingCohort.id ? editingCohort : c) : [...cohorts, editingCohort];
    await persist('cohorts', updated, setCohorts, 'Cohort');
    setShowCohortForm(false);
    setEditingCohort(null);
  }

  async function deleteCohort(id: string) {
    if (!confirm('Delete this cohort permanently?')) return;
    const updated = cohorts.filter((c) => c.id !== id);
    await persist('cohorts', updated, setCohorts, 'Cohort');
  }

  // ══════════════════════════════════════════════════════════════════════
  //  PROJECT CRUD
  // ══════════════════════════════════════════════════════════════════════
  function newProject(): Project {
    return { id: uid(), title: '', description: '', student_name: '', cohort: '', tags: [], github_url: '', demo_url: '', status: 'pending', submitted_at: new Date().toISOString().slice(0, 10) };
  }

  function openProjectForm(p?: Project) {
    setEditingProject(p ?? newProject());
    setShowProjectForm(true);
  }

  async function saveProject() {
    if (!editingProject) return;
    if (!editingProject.title.trim()) { flash('error', 'Project title is required.'); return; }
    if (!editingProject.student_name.trim()) { flash('error', 'Student name is required.'); return; }
    const exists = projects.find((p) => p.id === editingProject.id);
    const updated = exists ? projects.map((p) => p.id === editingProject.id ? editingProject : p) : [...projects, editingProject];
    await persist('projects', updated, setProjects, 'Project');
    setShowProjectForm(false);
    setEditingProject(null);
  }

  async function deleteProject(id: string) {
    if (!confirm('Delete this project permanently?')) return;
    const updated = projects.filter((p) => p.id !== id);
    await persist('projects', updated, setProjects, 'Project');
  }

  async function setProjectStatus(id: string, status: 'approved' | 'rejected') {
    const updated = projects.map((p) => p.id === id ? { ...p, status } : p);
    await persist('projects', updated, setProjects, 'Project status');
  }

  // ── Site Settings ──
  async function handleSaveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;
    const updated = { ...settings, updated_at: new Date().toISOString() };
    await persist('site-settings', updated, setSettings, 'Settings');
  }

  // Logout
  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/admin-auth', { method: 'DELETE' });
      router.push('/');
      router.refresh();
    } catch {
      flash('error', 'Failed to log out.');
      setLoggingOut(false);
    }
  }

  // Filtered lists
  const newsItems = articles.filter((a) => a.type === 'news');
  const eventItems = articles.filter((a) => a.type === 'event');
  const pendingProjects = projects.filter((p) => p.status === 'pending');

  // ══════════════════════════════════════════════════════════════════════
  //  INLINE MODAL
  // ══════════════════════════════════════════════════════════════════════
  function Modal({ title, onClose, onSave, children }: { title: string; onClose: () => void; onSave: () => void; children: React.ReactNode }) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px',
          width: '90%', maxWidth: '600px', maxHeight: '85vh', overflow: 'auto', padding: '28px 32px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{title}</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.3rem' }} aria-label="Close">✕</button>
          </div>
          {children}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
            <button onClick={onClose} className={styles.actionBtn} style={{ padding: '8px 20px' }}>Cancel</button>
            <button onClick={onSave} className="btn-primary" disabled={saving} style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className={styles.page}>
      {/* ── Top Bar ── */}
      <div className={styles.topBar}>
        <div className="container">
          <div className={styles.topBarInner}>
            <div className={styles.topBarLeft}>
              <div className={styles.topBarTitle}>Owner Dashboard</div>
              <div className={styles.topBarSub}>Alfarabi University · Full System Access · Owner Mode</div>
            </div>
            <div className={styles.topBarRight}>
              <div className={styles.ownerBadge}>
                <span className={styles.ownerDot} aria-hidden="true" />
                Owner
              </div>
              <Link href="/admin" className="btn-gold" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
                Admin View →
              </Link>
              <Link href="/" className="btn-gold" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
                ← Back to Site
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className={styles.logoutBtn}
                id="owner-logout-btn"
              >
                {loggingOut ? 'Logging out…' : '⏻ Logout'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Tab Bar ── */}
      <div className={styles.mobileTabBar}>
        <div className={styles.mobileTabScroll}>
          {sideItems.map((item) => (
            <button
              key={item.label}
              className={`${styles.mobileTab} ${activeItem === item.label ? styles.mobileTabActive : ''}`}
              onClick={() => setActiveItem(item.label)}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="container" style={{ padding: 0, maxWidth: '100%' }}>
        <div className={styles.layout}>

          {/* ── Sidebar ── */}
          <aside className={styles.sidebar} role="navigation" aria-label="Owner navigation">
            {['Overview', 'Owner Controls', 'Content', 'Configuration'].map((section) => (
              <div key={section} className={styles.sidebarSection}>
                <div className={styles.sidebarLabel}>{section}</div>
                {sideItems.filter((i) => i.section === section).map((item) => (
                  <button
                    key={item.label}
                    className={`${styles.sidebarLink} ${activeItem === item.label ? styles.sidebarLinkActive : ''}`}
                    onClick={() => setActiveItem(item.label)}
                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </aside>

          {/* ── Main ── */}
          <main className={styles.main}>

            {toast && <Toast msg={toast} />}

            {/* ══ DASHBOARD ══ */}
            {activeItem === 'Dashboard' && (
              <>
                <AnimateOnScroll>
                  <div className={styles.statsGrid} role="list" aria-label="Platform statistics">
                    {[
                      { num: String(cohorts.reduce((s, c) => s + c.student_count, 0)), label: 'Total Students', color: 'var(--gold)', icon: '👥' },
                      { num: String(cohorts.filter((c) => c.status === 'active').length), label: 'Active Cohorts', color: 'var(--crimson-light)', icon: '🏫' },
                      { num: String(articles.filter((a) => a.status === 'draft').length), label: 'Draft Articles', color: '#7eb3f9', icon: '📰' },
                      { num: String(pendingProjects.length), label: 'Projects Pending', color: '#a78bfa', icon: '🎓' },
                    ].map((s, i) => (
                      <AnimateOnScroll key={s.label} delay={i * 80}>
                        <div className={styles.statCard} role="listitem">
                          <div className={styles.statAccent} style={{ background: s.color }} aria-hidden="true" />
                          <div className={styles.statIcon} style={{ background: `${s.color}22` }}>
                            <span style={{ fontSize: '1.1rem' }} aria-hidden="true">{s.icon}</span>
                          </div>
                          <div className={styles.statNum}>{s.num}</div>
                          <div className={styles.statLabel}>{s.label}</div>
                        </div>
                      </AnimateOnScroll>
                    ))}
                  </div>
                </AnimateOnScroll>

                {/* Quick Nav */}
                <AnimateOnScroll delay={100}>
                  <div className={styles.panel}>
                    <div className={styles.panelHead}>
                      <div className={styles.panelTitle}>Quick Actions</div>
                    </div>
                    <div className={styles.panelBody}>
                      <div className={styles.quickGrid}>
                        <AnimateOnScroll delay={0}>
                          <button
                            className={styles.quickAction}
                            onClick={() => setActiveItem('Admin Password')}
                            style={{ background: 'none', border: '1px solid rgba(165,28,48,0.25)', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                          >
                            <div className={styles.quickIcon}>
                              <span style={{ fontSize: '1rem' }}>🔐</span>
                            </div>
                            <div>
                              <div className={styles.quickLabel}>Change Admin Password</div>
                            </div>
                          </button>
                        </AnimateOnScroll>
                        {sideItems.filter((i) => i.section === 'Content').map((item, i) => (
                          <AnimateOnScroll key={item.label} delay={(i + 1) * 60}>
                            <button
                              className={styles.quickAction}
                              onClick={() => setActiveItem(item.label)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                            >
                              <div className={styles.quickIcon}>
                                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                              </div>
                              <div>
                                <div className={styles.quickLabel}>{item.label}</div>
                              </div>
                            </button>
                          </AnimateOnScroll>
                        ))}
                        <AnimateOnScroll delay={300}>
                          <button
                            className={styles.quickAction}
                            onClick={() => setActiveItem('Site Settings')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                          >
                            <div className={styles.quickIcon}>
                              <span style={{ fontSize: '1rem' }}>⚙️</span>
                            </div>
                            <div>
                              <div className={styles.quickLabel}>Site Settings</div>
                            </div>
                          </button>
                        </AnimateOnScroll>
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              </>
            )}

            {/* ══ ADMIN PASSWORD ══ */}
            {activeItem === 'Admin Password' && (
              <AnimateOnScroll>
                <div className={styles.passwordPanel}>
                  <div className={styles.passwordTitle}>
                    🔐 Change Admin Password
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
                    As the system owner, you can change the admin password at any time. The admin uses this password to log into the CMS dashboard.
                  </p>

                  <div style={{ marginBottom: '20px' }}>
                    <div className={styles.label} style={{ marginBottom: '8px' }}>Current Admin Password</div>
                    <div className={styles.currentPwBadge}>
                      <span>{showCurrentPw && currentPassword ? currentPassword : '••••••••'}</span>
                      <button className={styles.eyeBtn} onClick={async () => {
                        if (!showCurrentPw && !currentPassword) {
                          try {
                            const res = await fetch('/api/owner/get-password');
                            const data = await res.json();
                            if (data.success) setCurrentPassword(data.password);
                          } catch { /* ignore */ }
                        }
                        setShowCurrentPw(!showCurrentPw);
                      }} aria-label="Toggle password visibility">
                        {showCurrentPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Click the eye icon to reveal the current admin password.
                    </div>
                  </div>

                  <div className={styles.passwordInputGroup}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="new-admin-pw">New Password</label>
                      <input
                        id="new-admin-pw"
                        type="password"
                        className={styles.input}
                        placeholder="Enter new password…"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="confirm-admin-pw">Confirm Password</label>
                      <input
                        id="confirm-admin-pw"
                        type="password"
                        className={styles.input}
                        placeholder="Confirm new password…"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    <button
                      className="btn-primary"
                      onClick={handleChangePassword}
                      disabled={changingPassword || !newPassword.trim()}
                      style={{ padding: '10px 24px', fontSize: '0.85rem', whiteSpace: 'nowrap', height: 'fit-content' }}
                    >
                      {changingPassword ? 'Changing…' : '🔑 Change Password'}
                    </button>
                  </div>

                  <p className={styles.passwordNote}>
                    ⚠️ After changing the password, you may need to restart the development server for the change to take effect.
                    The admin will need to use the new password to log in next time.
                  </p>
                </div>
              </AnimateOnScroll>
            )}

            {/* ══ NEWS & ARTICLES ══ */}
            {activeItem === 'News & Articles' && (
              <AnimateOnScroll>
                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <div className={styles.panelTitle}>📰 News & Articles</div>
                    <button className="btn-primary" id="owner-add-article" style={{ fontSize: '0.82rem', padding: '7px 16px' }}
                      onClick={() => openArticleForm(undefined, 'news')}>
                      + Add Article
                    </button>
                  </div>
                  <div className={styles.panelBody}>
                    {newsItems.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        No articles yet. Click <strong>+ Add Article</strong> to create your first one.
                      </div>
                    )}
                    <div className={styles.contentList}>
                      {newsItems.map((a) => (
                        <div key={a.id} className={styles.contentItem}>
                          <div className={styles.contentLeft}>
                            <div className={styles.contentIcon} style={{ background: 'rgba(212,175,55,0.15)' }}><span>📰</span></div>
                            <div>
                              <div className={styles.contentTitle}>{a.title || 'Untitled'}</div>
                              <div className={styles.contentMeta}>{a.author || 'No author'} · {a.published_at ? new Date(a.published_at).toLocaleDateString() : '—'}</div>
                            </div>
                          </div>
                          <div className={styles.contentActions}>
                            <StatusBadge status={a.status} />
                            <button className={styles.actionBtn} onClick={() => toggleArticleStatus(a.id)}>
                              {a.status === 'published' ? 'Unpublish' : 'Publish'}
                            </button>
                            <button className={styles.actionBtn} onClick={() => openArticleForm(a)}>Edit</button>
                            <button className={styles.actionBtn} style={{ color: 'var(--crimson-light)' }} onClick={() => deleteArticle(a.id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            )}

            {/* ══ EVENTS & CALENDAR ══ */}
            {activeItem === 'Events & Calendar' && (
              <AnimateOnScroll>
                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <div className={styles.panelTitle}>📅 Events & Calendar</div>
                    <button className="btn-primary" id="owner-add-event" style={{ fontSize: '0.82rem', padding: '7px 16px' }}
                      onClick={() => openArticleForm(undefined, 'event')}>
                      + Add Event
                    </button>
                  </div>
                  <div className={styles.panelBody}>
                    {eventItems.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        No events yet. Click <strong>+ Add Event</strong> to schedule your first one.
                      </div>
                    )}
                    <div className={styles.contentList}>
                      {eventItems.map((a) => (
                        <div key={a.id} className={styles.contentItem}>
                          <div className={styles.contentLeft}>
                            <div className={styles.contentIcon} style={{ background: 'rgba(165,28,48,0.15)' }}><span>📅</span></div>
                            <div>
                              <div className={styles.contentTitle}>{a.title || 'Untitled'}</div>
                              <div className={styles.contentMeta}>{a.author || 'No organizer'} · {a.published_at ? new Date(a.published_at).toLocaleDateString() : '—'}</div>
                            </div>
                          </div>
                          <div className={styles.contentActions}>
                            <StatusBadge status={a.status} />
                            <button className={styles.actionBtn} onClick={() => toggleArticleStatus(a.id)}>
                              {a.status === 'published' ? 'Unpublish' : 'Publish'}
                            </button>
                            <button className={styles.actionBtn} onClick={() => openArticleForm(a)}>Edit</button>
                            <button className={styles.actionBtn} style={{ color: 'var(--crimson-light)' }} onClick={() => deleteArticle(a.id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            )}

            {/* ══ CLASSES & COHORTS ══ */}
            {activeItem === 'Classes & Cohorts' && (
              <AnimateOnScroll>
                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <div className={styles.panelTitle}>🏫 Classes & Cohorts</div>
                    <button className="btn-primary" id="owner-add-cohort" style={{ fontSize: '0.82rem', padding: '7px 16px' }}
                      onClick={() => openCohortForm()}>
                      + Add Cohort
                    </button>
                  </div>
                  <div className={styles.panelBody} style={{ padding: '0 22px 20px' }}>
                    {cohorts.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        No cohorts yet. Click <strong>+ Add Cohort</strong> to create your first class.
                      </div>
                    )}
                    {cohorts.length > 0 && (
                      <table className={styles.table} aria-label="Cohorts">
                        <thead>
                          <tr className={styles.tableHead}>
                            <th>Cohort</th><th>Rep</th><th>Students</th><th>Status</th><th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cohorts.map((c) => (
                            <tr key={c.id} className={styles.tableRow}>
                              <td className={styles.userName}>{c.title}</td>
                              <td>{c.rep_name}</td>
                              <td>{c.student_count}</td>
                              <td><StatusBadge status={c.status} /></td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button className={styles.actionBtn} onClick={() => openCohortForm(c)}>Edit</button>
                                  <button className={styles.actionBtn} style={{ color: 'var(--crimson-light)' }} onClick={() => deleteCohort(c.id)}>Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </AnimateOnScroll>
            )}

            {/* ══ STUDENT PROJECTS ══ */}
            {activeItem === 'Student Projects' && (
              <AnimateOnScroll>
                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <div className={styles.panelTitle}>🎓 Student Projects</div>
                    <button className="btn-primary" id="owner-add-project" style={{ fontSize: '0.82rem', padding: '7px 16px' }}
                      onClick={() => openProjectForm()}>
                      + Add Project
                    </button>
                  </div>
                  <div className={styles.panelBody} style={{ padding: '0 22px 20px' }}>
                    {projects.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        No projects yet. Click <strong>+ Add Project</strong> to add your first student project.
                      </div>
                    )}
                    {projects.length > 0 && (
                      <table className={styles.table} aria-label="Student projects">
                        <thead>
                          <tr className={styles.tableHead}>
                            <th>Project</th><th>Student</th><th>Tags</th><th>Status</th><th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects.map((p) => (
                            <tr key={p.id} className={styles.tableRow}>
                              <td className={styles.userName}>{p.title}</td>
                              <td>{p.student_name}</td>
                              <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.tags.join(', ')}</td>
                              <td><StatusBadge status={p.status} /></td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  {p.status === 'pending' && (
                                    <>
                                      <button className={styles.actionBtn} onClick={() => setProjectStatus(p.id, 'approved')}>Approve</button>
                                      <button className={styles.actionBtn} onClick={() => setProjectStatus(p.id, 'rejected')}>Reject</button>
                                    </>
                                  )}
                                  <button className={styles.actionBtn} onClick={() => openProjectForm(p)}>Edit</button>
                                  <button className={styles.actionBtn} style={{ color: 'var(--crimson-light)' }} onClick={() => deleteProject(p.id)}>Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </AnimateOnScroll>
            )}

            {/* ══ SITE SETTINGS ══ */}
            {activeItem === 'Site Settings' && (
              <AnimateOnScroll>
                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <div className={styles.panelTitle}>⚙️ Site Settings</div>
                    {settings && (
                      <span className={styles.sectionTitleRight} style={{ fontSize: '0.75rem' }}>
                        Last saved: {settings.updated_at ? new Date(settings.updated_at).toLocaleString() : 'Never'}
                      </span>
                    )}
                  </div>
                  <div className={styles.panelBody}>
                    {settings ? (
                      <form onSubmit={handleSaveSettings}>
                        <div className={styles.formGrid}>
                          {[
                            { id: 'owner-site-name', label: 'Site Name', key: 'site_name' },
                            { id: 'owner-dept-name', label: 'Department Name', key: 'department_name' },
                            { id: 'owner-city', label: 'City', key: 'city' },
                            { id: 'owner-country', label: 'Country', key: 'country' },
                            { id: 'owner-contact-email', label: 'Contact Email', key: 'contact_email' },
                            { id: 'owner-phone', label: 'Phone', key: 'phone' },
                            { id: 'owner-hero-title', label: 'Hero Title', key: 'hero_title' },
                            { id: 'owner-founded-year', label: 'Founded Year', key: 'founded_year', type: 'number' },
                            { id: 'owner-total-students', label: 'Total Students', key: 'total_students', type: 'number' },
                            { id: 'owner-research-papers', label: 'Research Papers', key: 'research_papers', type: 'number' },
                            { id: 'owner-specializations', label: 'AI Specializations', key: 'ai_specializations', type: 'number' },
                            { id: 'owner-partner-unis', label: 'Partner Universities', key: 'partner_universities', type: 'number' },
                            { id: 'owner-total-courses', label: 'Total Courses', key: 'total_courses', type: 'number' },
                            { id: 'owner-research-labs', label: 'Research Labs', key: 'research_labs', type: 'number' },
                            { id: 'owner-employment', label: 'Employment Rate (%)', key: 'employment_rate', type: 'number' },
                            { id: 'owner-exchange', label: 'Exchange Partners', key: 'exchange_partners', type: 'number' },
                            { id: 'owner-graduates', label: 'Total Graduates', key: 'total_graduates', type: 'number' },
                            { id: 'owner-degree-levels', label: 'Degree Levels', key: 'degree_levels', type: 'number' },
                            { id: 'owner-published', label: 'Published Papers', key: 'published_papers', type: 'number' },
                            { id: 'owner-grad-employ', label: 'Graduate Employment (%)', key: 'grad_employment', type: 'number' },
                            { id: 'owner-industry', label: 'Industry Partners', key: 'industry_partners', type: 'number' },
                            { id: 'owner-dept-ranking', label: 'Dept Ranking (e.g. #1)', key: 'dept_ranking' },
                          ].map((f) => (
                            <div key={f.id} className={styles.formGroup}>
                              <label className={styles.label} htmlFor={f.id}>{f.label}</label>
                              <input
                                id={f.id}
                                type={f.type ?? 'text'}
                                className={styles.input}
                                value={(settings as any)[f.key] ?? ''}
                                onChange={(e) => setSettings({ ...settings, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                              />
                            </div>
                          ))}
                          <div className={`${styles.formGroup} ${styles.full}`}>
                            <label className={styles.label} htmlFor="owner-hero-subtitle">Hero Subtitle</label>
                            <input
                              id="owner-hero-subtitle"
                              className={styles.input}
                              value={settings.hero_subtitle}
                              onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                            />
                          </div>
                          <div className={`${styles.formGroup} ${styles.full}`}>
                            <label className={styles.label} htmlFor="owner-about">Description</label>
                            <textarea
                              id="owner-about"
                              className={styles.textarea}
                              value={settings.description}
                              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* ── Mission / About ── */}
                        <div style={{ margin: '24px 0 12px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>📝 Mission / About Page</div>
                        <div className={styles.formGrid}>
                          {[
                            { id: 'owner-mission-title', label: 'Mission Title', key: 'mission_title' },
                            { id: 'owner-mission-accent', label: 'Mission Title Accent (gold word)', key: 'mission_title_accent' },
                          ].map((f) => (
                            <div key={f.id} className={styles.formGroup}>
                              <label className={styles.label} htmlFor={f.id}>{f.label}</label>
                              <input
                                id={f.id}
                                className={styles.input}
                                value={(settings as any)[f.key] ?? ''}
                                onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                              />
                            </div>
                          ))}
                          <div className={`${styles.formGroup} ${styles.full}`}>
                            <label className={styles.label} htmlFor="owner-mission-p1">Mission Paragraph 1</label>
                            <textarea
                              id="owner-mission-p1"
                              className={styles.textarea}
                              value={(settings as any).mission_p1 ?? ''}
                              onChange={(e) => setSettings({ ...settings, mission_p1: e.target.value })}
                            />
                          </div>
                          <div className={`${styles.formGroup} ${styles.full}`}>
                            <label className={styles.label} htmlFor="owner-mission-p2">Mission Paragraph 2</label>
                            <textarea
                              id="owner-mission-p2"
                              className={styles.textarea}
                              value={(settings as any).mission_p2 ?? ''}
                              onChange={(e) => setSettings({ ...settings, mission_p2: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* ── Flagship Program ── */}
                        <div style={{ margin: '24px 0 12px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>🎓 Flagship Program (Programs Page)</div>
                        <div className={styles.formGrid}>
                          {[
                            { id: 'owner-flagship-heading', label: 'Program Heading', key: 'flagship_heading' },
                            { id: 'owner-flagship-title', label: 'Banner Title', key: 'flagship_title' },
                            { id: 'owner-flagship-accent', label: 'Banner Title Accent (gold word)', key: 'flagship_title_accent' },
                          ].map((f) => (
                            <div key={f.id} className={styles.formGroup}>
                              <label className={styles.label} htmlFor={f.id}>{f.label}</label>
                              <input
                                id={f.id}
                                className={styles.input}
                                value={(settings as any)[f.key] ?? ''}
                                onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                              />
                            </div>
                          ))}
                          <div className={`${styles.formGroup} ${styles.full}`}>
                            <label className={styles.label} htmlFor="owner-flagship-desc">Banner Description</label>
                            <textarea
                              id="owner-flagship-desc"
                              className={styles.textarea}
                              value={(settings as any).flagship_desc ?? ''}
                              onChange={(e) => setSettings({ ...settings, flagship_desc: e.target.value })}
                            />
                          </div>
                          <div className={`${styles.formGroup} ${styles.full}`}>
                            <label className={styles.label} htmlFor="owner-flagship-highlights">Highlights (comma-separated)</label>
                            <input
                              id="owner-flagship-highlights"
                              className={styles.input}
                              value={(settings as any).flagship_highlights ?? ''}
                              onChange={(e) => setSettings({ ...settings, flagship_highlights: e.target.value })}
                              placeholder="240 ECTS Credits, 4 Year Duration, Industry Projects"
                            />
                          </div>
                        </div>

                        {/* ── Branding ── */}
                        <div style={{ margin: '24px 0 12px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>🎨 Branding</div>
                        <div className={styles.formGrid}>
                          <div className={`${styles.formGroup} ${styles.full}`}>
                            <label className={styles.label} htmlFor="owner-logo-url">Logo URL</label>
                            <input
                              id="owner-logo-url"
                              className={styles.input}
                              value={settings.logo_url}
                              placeholder="https://example.com/logo.png"
                              onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                            />
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Paste a URL to your logo image. Leave empty for the default shield icon.</span>
                          </div>
                        </div>

                        {/* ── Social Links ── */}
                        <div style={{ margin: '24px 0 12px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>🔗 Social Links</div>
                        <div className={styles.formGrid}>
                          {[
                            { id: 'owner-social-telegram', label: 'Telegram', key: 'social_telegram', placeholder: 'https://t.me/yourchannel' },
                            { id: 'owner-social-instagram', label: 'Instagram', key: 'social_instagram', placeholder: 'https://instagram.com/yourpage' },
                            { id: 'owner-social-linkedin', label: 'LinkedIn', key: 'social_linkedin', placeholder: 'https://linkedin.com/company/yourpage' },
                            { id: 'owner-social-youtube', label: 'YouTube', key: 'social_youtube', placeholder: 'https://youtube.com/@yourchannel' },
                            { id: 'owner-social-twitter', label: 'Twitter / X', key: 'social_twitter', placeholder: 'https://x.com/yourhandle' },
                            { id: 'owner-social-facebook', label: 'Facebook', key: 'social_facebook', placeholder: 'https://facebook.com/yourpage' },
                          ].map((f) => (
                            <div key={f.id} className={styles.formGroup}>
                              <label className={styles.label} htmlFor={f.id}>{f.label}</label>
                              <input
                                id={f.id}
                                className={styles.input}
                                value={(settings as any)[f.key] ?? ''}
                                placeholder={f.placeholder}
                                onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                              />
                            </div>
                          ))}
                        </div>
                        <div className={styles.formActions} style={{ marginTop: '16px' }}>
                          <button
                            type="submit"
                            className="btn-primary"
                            id="owner-save-settings"
                            disabled={saving}
                            style={{ fontSize: '0.85rem', padding: '9px 20px' }}
                          >
                            {saving ? 'Saving…' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Loading settings…</div>
                    )}
                  </div>
                </div>
              </AnimateOnScroll>
            )}

          </main>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  MODALS                                                          */}
      {/* ══════════════════════════════════════════════════════════════════ */}

      {/* Article / Event Modal */}
      {showArticleForm && editingArticle && (
        <Modal
          title={articles.find((a) => a.id === editingArticle.id) ? `Edit ${editingArticle.type === 'news' ? 'Article' : 'Event'}` : `New ${editingArticle.type === 'news' ? 'Article' : 'Event'}`}
          onClose={() => { setShowArticleForm(false); setEditingArticle(null); }}
          onSave={saveArticle}
        >
          <FormRow>
            <Field id="article-title" label="Title" value={editingArticle.title} placeholder="Enter a title…"
              onChange={(v) => setEditingArticle({ ...editingArticle, title: v })} full />
          </FormRow>
          <FormRow>
            <Field id="article-summary" label="Summary" value={editingArticle.summary} type="textarea" placeholder="Write a short summary…"
              onChange={(v) => setEditingArticle({ ...editingArticle, summary: v })} full />
          </FormRow>
          <FormRow>
            <Field id="article-author" label={editingArticle.type === 'news' ? 'Author' : 'Organizer'} value={editingArticle.author} placeholder="Name"
              onChange={(v) => setEditingArticle({ ...editingArticle, author: v })} />
            <Field id="article-date" label="Publish Date" value={editingArticle.published_at.slice(0, 10)} type="date"
              onChange={(v) => setEditingArticle({ ...editingArticle, published_at: v })} />
          </FormRow>
          <FormRow>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="article-status">Status</label>
              <select id="article-status" className={styles.input} value={editingArticle.status}
                onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value as 'published' | 'draft' })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="article-type">Type</label>
              <select id="article-type" className={styles.input} value={editingArticle.type}
                onChange={(e) => setEditingArticle({
                  ...editingArticle,
                  type: e.target.value as 'news' | 'event',
                  ...(e.target.value === 'event' && !editingArticle.event_date ? { event_date: editingArticle.published_at, category: 'seminar', location: '', time: '', cohort: '' } : {}),
                })}>
                <option value="news">News</option>
                <option value="event">Event</option>
              </select>
            </div>
          </FormRow>

          {editingArticle.type === 'event' && (
            <>
              <div style={{ margin: '18px 0 10px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>📅 Event Details</div>
              <FormRow>
                <Field id="event-date" label="Event Date" value={editingArticle.event_date?.slice(0, 10) ?? ''} type="date"
                  onChange={(v) => setEditingArticle({ ...editingArticle, event_date: v })} />
                <Field id="event-time" label="Time" value={editingArticle.time ?? ''} placeholder="10:00 AM – 12:00 PM"
                  onChange={(v) => setEditingArticle({ ...editingArticle, time: v })} />
              </FormRow>
              <FormRow>
                <Field id="event-location" label="Location" value={editingArticle.location ?? ''} placeholder="Hall A, Building 3"
                  onChange={(v) => setEditingArticle({ ...editingArticle, location: v })} />
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="event-category">Category</label>
                  <select id="event-category" className={styles.input} value={editingArticle.category ?? 'seminar'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}>
                    <option value="seminar">Seminar</option>
                    <option value="exam">Exam</option>
                    <option value="deadline">Deadline</option>
                    <option value="social">Social</option>
                    <option value="lecture">Lecture</option>
                    <option value="workshop">Workshop</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </FormRow>
              <FormRow>
                <Field id="event-cohort" label="Cohort (optional)" value={editingArticle.cohort ?? ''} placeholder="All cohorts, or specific e.g. Cohort 2024"
                  onChange={(v) => setEditingArticle({ ...editingArticle, cohort: v })} full />
              </FormRow>
            </>
          )}
        </Modal>
      )}

      {/* Cohort Modal */}
      {showCohortForm && editingCohort && (
        <Modal
          title={cohorts.find((c) => c.id === editingCohort.id) ? 'Edit Cohort' : 'New Cohort'}
          onClose={() => { setShowCohortForm(false); setEditingCohort(null); }}
          onSave={saveCohort}
        >
          <FormRow>
            <Field id="cohort-title" label="Cohort Title" value={editingCohort.title} placeholder="e.g. Cohort 2024–2025"
              onChange={(v) => setEditingCohort({ ...editingCohort, title: v })} />
            <Field id="cohort-year" label="Enrollment Year" value={editingCohort.year} type="number"
              onChange={(v) => setEditingCohort({ ...editingCohort, year: Number(v) })} />
          </FormRow>
          <FormRow>
            <Field id="cohort-desc" label="Description" value={editingCohort.description} type="textarea" placeholder="Describe this cohort…"
              onChange={(v) => setEditingCohort({ ...editingCohort, description: v })} full />
          </FormRow>
          <FormRow>
            <Field id="cohort-rep" label="Representative Name" value={editingCohort.rep_name} placeholder="Student rep name"
              onChange={(v) => setEditingCohort({ ...editingCohort, rep_name: v })} />
            <Field id="cohort-rep-email" label="Representative Email" value={editingCohort.rep_email} placeholder="rep@email.com"
              onChange={(v) => setEditingCohort({ ...editingCohort, rep_email: v })} />
          </FormRow>
          <FormRow>
            <Field id="cohort-students" label="Student Count" value={editingCohort.student_count} type="number"
              onChange={(v) => setEditingCohort({ ...editingCohort, student_count: Number(v) })} />
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="cohort-status">Status</label>
              <select id="cohort-status" className={styles.input} value={editingCohort.status}
                onChange={(e) => setEditingCohort({ ...editingCohort, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </FormRow>
        </Modal>
      )}

      {/* Project Modal */}
      {showProjectForm && editingProject && (
        <Modal
          title={projects.find((p) => p.id === editingProject.id) ? 'Edit Project' : 'New Project'}
          onClose={() => { setShowProjectForm(false); setEditingProject(null); }}
          onSave={saveProject}
        >
          <FormRow>
            <Field id="project-title" label="Project Title" value={editingProject.title} placeholder="Project name"
              onChange={(v) => setEditingProject({ ...editingProject, title: v })} full />
          </FormRow>
          <FormRow>
            <Field id="project-desc" label="Description" value={editingProject.description} type="textarea" placeholder="What does this project do?"
              onChange={(v) => setEditingProject({ ...editingProject, description: v })} full />
          </FormRow>
          <FormRow>
            <Field id="project-student" label="Student Name" value={editingProject.student_name} placeholder="Student's full name"
              onChange={(v) => setEditingProject({ ...editingProject, student_name: v })} />
            <Field id="project-cohort" label="Cohort" value={editingProject.cohort} placeholder="e.g. Cohort 2024"
              onChange={(v) => setEditingProject({ ...editingProject, cohort: v })} />
          </FormRow>
          <FormRow>
            <Field id="project-tags" label="Tags (comma-separated)" value={editingProject.tags.join(', ')} placeholder="NLP, Python, CV"
              onChange={(v) => setEditingProject({ ...editingProject, tags: v.split(',').map((t) => t.trim()).filter(Boolean) })} full />
          </FormRow>
          <FormRow>
            <Field id="project-github" label="GitHub URL" value={editingProject.github_url} placeholder="https://github.com/…"
              onChange={(v) => setEditingProject({ ...editingProject, github_url: v })} />
            <Field id="project-demo" label="Demo URL" value={editingProject.demo_url} placeholder="https://demo.example.com"
              onChange={(v) => setEditingProject({ ...editingProject, demo_url: v })} />
          </FormRow>
          <FormRow>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="project-status">Status</label>
              <select id="project-status" className={styles.input} value={editingProject.status}
                onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as 'approved' | 'pending' | 'rejected' })}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <Field id="project-date" label="Submitted Date" value={editingProject.submitted_at.slice(0, 10)} type="date"
              onChange={(v) => setEditingProject({ ...editingProject, submitted_at: v })} />
          </FormRow>
        </Modal>
      )}

    </div>
  );
}
