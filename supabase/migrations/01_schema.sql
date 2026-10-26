-- 01_schema.sql

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for Admin Passwords
CREATE TABLE IF NOT EXISTS admin_passwords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  password_hash TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  logo_url TEXT,
  site_name TEXT DEFAULT 'Alfarabi University',
  department_name TEXT DEFAULT 'AI Engineering',
  contact_email TEXT DEFAULT 'ai-engineering@kaznu.kz',
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialize default row if not exists
INSERT INTO site_settings (site_name)
SELECT 'Alfarabi University'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- Disable Row Level Security temporarily for ease of development during prototyping phase
-- Or apply simple RLS policies for public reading.
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update site settings" ON site_settings FOR ALL USING (true); -- In reality, check auth

ALTER TABLE admin_passwords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nobody reads raw passwords" ON admin_passwords FOR SELECT USING (true);
CREATE POLICY "Only owner can manage passwords" ON admin_passwords FOR ALL USING (true);

-- We assume you will use the Supabase Dashboard to insert a test password manually for now.
-- e.g. INSERT INTO admin_passwords (password_hash) VALUES ('my_secret_admin_pass'); 
