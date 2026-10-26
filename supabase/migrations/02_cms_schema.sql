-- 02_cms_schema.sql
-- CMS content tables for Alfarabi University platform

-- ──────────────────────────────────────────────
-- Portfolio / Student Projects
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',         -- e.g. {'NLP', 'Computer Vision'}
  team_members TEXT[] DEFAULT '{}',
  cohort TEXT,                       -- e.g. 'Cohort 2023'
  github_url TEXT,
  demo_url TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'pending',     -- 'pending' | 'approved' | 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read approved projects" ON portfolio_projects
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Admins can manage all projects" ON portfolio_projects
  FOR ALL USING (true);

-- ──────────────────────────────────────────────
-- Cohorts / Classes
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,               -- e.g. 'Cohort 2022'
  year INTEGER,
  description TEXT,
  total_students INTEGER DEFAULT 0,
  attendance_rate NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'active',     -- 'active' | 'graduated'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cohort_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'info',         -- 'info' | 'warning' | 'success'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read cohorts" ON cohorts FOR SELECT USING (true);
CREATE POLICY "Admins can manage cohorts" ON cohorts FOR ALL USING (true);

ALTER TABLE cohort_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read announcements" ON cohort_announcements FOR SELECT USING (true);
CREATE POLICY "Admins can manage announcements" ON cohort_announcements FOR ALL USING (true);

-- ──────────────────────────────────────────────
-- Articles / News & Events
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  category TEXT DEFAULT 'news',     -- 'news' | 'event' | 'research' | 'campus' | 'academic'
  image_url TEXT,
  event_date TIMESTAMP WITH TIME ZONE,   -- For events only
  cohort_filter TEXT,               -- Optional cohort tag for calendar
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published articles" ON articles
  FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage all articles" ON articles
  FOR ALL USING (true);

-- ──────────────────────────────────────────────
-- Programs
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  degree TEXT,                      -- e.g. 'Bachelor of Science'
  duration TEXT,                    -- e.g. '4 Years'
  description TEXT,
  requirements TEXT[] DEFAULT '{}',
  icon TEXT DEFAULT '🎓',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read programs" ON programs FOR SELECT USING (true);
CREATE POLICY "Admins can manage programs" ON programs FOR ALL USING (true);

-- ──────────────────────────────────────────────
-- Seed: Default data so the site isn't empty
-- ──────────────────────────────────────────────
INSERT INTO cohorts (name, year, total_students, attendance_rate, status) VALUES
  ('Cohort 2022', 2022, 148, 94.2, 'active'),
  ('Cohort 2023', 2023, 151, 91.7, 'active'),
  ('Cohort 2024', 2024, 143, 89.4, 'active'),
  ('Cohort 2025', 2025, 142, 88.1, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO programs (title, degree, duration, description, requirements, icon, sort_order) VALUES
  ('Artificial Intelligence', 'Bachelor of Science', '4 Years', 'Core ML, deep learning, NLP, and computer vision curriculum.', ARRAY['Math (A-level or equivalent)', 'Programming basics', 'English proficiency'], '🤖', 1),
  ('Data Science & Analytics', 'Bachelor of Science', '4 Years', 'Statistics, big data pipelines, and business intelligence.', ARRAY['Statistics background', 'Python or R basics'], '📊', 2),
  ('Robotics & Automation', 'Bachelor of Engineering', '4 Years', 'Hardware-software integration, control systems, and embedded AI.', ARRAY['Physics (A-level)', 'Math fundamentals'], '🦾', 3)
ON CONFLICT DO NOTHING;
