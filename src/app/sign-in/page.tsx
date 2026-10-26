'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './auth.module.css';

export default function SignInPage() {
  const router = useRouter();
  const passwordRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const password = passwordRef.current!.value;

    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'Invalid password.');

      // Determine redirect based on role
      const redirectTo = data.role === 'owner' ? '/owner' : '/admin';

      setSuccess('Access granted! Redirecting…');
      // Clear the password field immediately
      if (passwordRef.current) passwordRef.current.value = '';
      setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Invalid password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden="true" />

      <div className={styles.container}>
        {/* Left panel */}
        <div className={styles.leftPanel}>
          <div className={styles.brand}>
            <div className={styles.logoBox}>
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <rect width="40" height="40" rx="10" fill="rgba(212,175,55,0.15)"/>
                <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="var(--gold)" fontSize="22" fontWeight="700" fontFamily="serif">F</text>
              </svg>
            </div>
            <div>
              <div className={styles.brandName}>Alfarabi University</div>
              <div className={styles.brandSub}>AI Engineering Department</div>
            </div>
          </div>

          <div className={styles.leftContent}>
            <h1 className={styles.leftTitle}>
              Platform <span className="text-gradient-gold">Management</span>
            </h1>
            <p className={styles.leftDesc}>
              Secure login portal for University Administrators.
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className={styles.rightPanel}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Welcome back</h2>
              <p className={styles.formSub}>Enter your admin password to continue</p>
            </div>

            {error && (
              <div className={styles.alertError} role="alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}
            {success && (
              <div className={styles.alertSuccess} role="status">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                {success}
              </div>
            )}

            <form className={styles.form} id="signin-form" onSubmit={handleSubmit} autoComplete="off">
              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}>
                  <label htmlFor="signin-password" className={styles.label}>Admin Password</label>
                </div>
                <div className={styles.inputWrap}>
                  <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  <input
                    ref={passwordRef}
                    id="signin-password"
                    type="password"
                    className={styles.input}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoFocus
                    autoComplete="off"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`${styles.submitBtn} btn-primary`}
                id="signin-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    Access CMS
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
