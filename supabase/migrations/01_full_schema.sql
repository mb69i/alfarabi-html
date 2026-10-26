-- ============================================================
-- ALFARABI UNIVERSITY — BAGHDAD, IRAQ
-- Full CMS Schema (clean version, no extension dependencies)
-- Run this entire script in one go in the Supabase SQL Editor
-- ============================================================

-- ── 1. Admin Passwords ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Nobody reads raw passwords" ON admin_passwords;
DROP POLICY IF EXISTS "Only owner can manage passwords" ON admin_passwords;

ALTER TABLE admin_passwords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can select admin_passwords" ON admin_passwords FOR SELECT USING (true);
CREATE POLICY "Anyone can insert admin_passwords" ON admin_passwords FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete admin_passwords" ON admin_passwords FOR DELETE USING (true);

-- Insert default admin password (change 'admin123' to whatever you want)
INSERT INTO admin_passwords (password_hash, label)
VALUES ('admin123', 'Default Admin Password');

-- ── 2. Site Settings ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url TEXT,
  site_name TEXT DEFAULT 'Al-Farabi University',
  department_name TEXT DEFAULT 'AI Engineering',
  contact_email TEXT DEFAULT 'malbaqr954@gmail.com',
  city TEXT DEFAULT 'Baghdad',
  country TEXT DEFAULT 'Iraq',
  description TEXT DEFAULT 'Al-Farabi University — shaping the next generation of AI engineers in Baghdad, Iraq.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Public can read site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can update site_settings" ON site_settings FOR ALL USING (true);

-- Insert default row only if table is empty
INSERT INTO site_settings (site_name, contact_email, city, country)
SELECT 'Al-Farabi University', 'malbaqr954@gmail.com', 'Baghdad', 'Iraq'
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);

-- ── 3. Cohorts ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  year INTEGER,
  description TEXT,
  total_students INTEGER DEFAULT 0,
  attendance_rate NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Public can read cohorts" ON cohorts;
DROP POLICY IF EXISTS "Admins can manage cohorts" ON cohorts;

ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cohorts" ON cohorts FOR SELECT USING (true);
CREATE POLICY "Anyone can modify cohorts" ON cohorts FOR ALL USING (true);

INSERT INTO cohorts (name, year, total_students, attendance_rate, status) VALUES
  ('Cohort 2022', 2022, 148, 94.2, 'active'),
  ('Cohort 2023', 2023, 151, 91.7, 'active'),
  ('Cohort 2024', 2024, 143, 89.4, 'active'),
  ('Cohort 2025', 2025, 142, 88.1, 'active');

-- ── 4. Cohort Announcements ─────────────────────────────────
CREATE TABLE IF NOT EXISTS cohort_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Public can read announcements" ON cohort_announcements;
DROP POLICY IF EXISTS "Admins can manage announcements" ON cohort_announcements;

ALTER TABLE cohort_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cohort_announcements" ON cohort_announcements FOR SELECT USING (true);
CREATE POLICY "Anyone can modify cohort_announcements" ON cohort_announcements FOR ALL USING (true);

-- ── 5. Articles (News + Events) ─────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  category TEXT DEFAULT 'news',
  image_url TEXT,
  event_date TIMESTAMPTZ,
  cohort_filter TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Public can read published articles" ON articles;
DROP POLICY IF EXISTS "Admins can manage all articles" ON articles;

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Anyone can modify articles" ON articles FOR ALL USING (true);

-- ── 6. Portfolio Projects ───────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  team_members TEXT[] DEFAULT '{}',
  cohort TEXT,
  github_url TEXT,
  demo_url TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Public can read approved projects" ON portfolio_projects;
DROP POLICY IF EXISTS "Admins can manage all projects" ON portfolio_projects;

ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read portfolio_projects" ON portfolio_projects FOR SELECT USING (true);
CREATE POLICY "Anyone can modify portfolio_projects" ON portfolio_projects FOR ALL USING (true);

-- ── 7. Programs ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  degree TEXT,
  duration TEXT,
  description TEXT,
  requirements TEXT[] DEFAULT '{}',
  icon TEXT DEFAULT '🎓',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "Public can read programs" ON programs;
DROP POLICY IF EXISTS "Admins can manage programs" ON programs;

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read programs" ON programs FOR SELECT USING (true);
CREATE POLICY "Anyone can modify programs" ON programs FOR ALL USING (true);

INSERT INTO programs (title, degree, duration, description, requirements, icon, sort_order) VALUES
  ('Artificial Intelligence', 'Bachelor of Science', '4 Years', 'Core ML, deep learning, NLP, and computer vision curriculum.', ARRAY['Math (A-level or equivalent)', 'Programming basics', 'English proficiency'], '🤖', 1),
  ('Data Science & Analytics', 'Bachelor of Science', '4 Years', 'Statistics, big data pipelines, and business intelligence.', ARRAY['Statistics background', 'Python or R basics'], '📊', 2),
  ('Robotics & Automation', 'Bachelor of Engineering', '4 Years', 'Hardware-software integration, control systems, and embedded AI.', ARRAY['Physics (A-level)', 'Math fundamentals'], '🦾', 3);

-- ============================================================
-- Done! All tables created with seed data.
-- ============================================================
