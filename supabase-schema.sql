-- ============================================================
-- BMS — Business Management System
-- Supabase SQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  service_type TEXT NOT NULL,
  date DATE,
  description TEXT NOT NULL DEFAULT '',
  urgent BOOLEAN NOT NULL DEFAULT false,
  added_by TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  deleted_by_name TEXT,
  deleted_by_email TEXT
);

-- Run this against an EXISTING database (table already created) to add
-- urgent-appointment support without losing data:
-- ALTER TABLE appointments ADD COLUMN IF NOT EXISTS urgent BOOLEAN NOT NULL DEFAULT false;
-- ALTER TABLE appointments ALTER COLUMN date DROP NOT NULL;

-- 1b. APPOINTMENT IMAGES TABLE
CREATE TABLE IF NOT EXISTS appointment_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PRODUCTS (STOCK) TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  buying_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TRANSACTIONS (CAISSE) TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
  amount NUMERIC(12,2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable so only authenticated users can access data
-- ============================================================

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can do everything
CREATE POLICY "Authenticated users can manage appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

ALTER TABLE appointment_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage appointment images"
  ON appointment_images FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at ON appointments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_appointment_images_appointment_id ON appointment_images(appointment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- ============================================================
-- MIGRATION: run this against an EXISTING database to add
-- appointment images + soft-delete/recycle-bin support.
-- ============================================================
-- ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
-- ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_by_name TEXT;
-- ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_by_email TEXT;
-- CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at ON appointments(deleted_at);
--
-- CREATE TABLE IF NOT EXISTS appointment_images (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
--   storage_path TEXT NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT now()
-- );
-- ALTER TABLE appointment_images ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Authenticated users can manage appointment images" ON appointment_images;
-- CREATE POLICY "Authenticated users can manage appointment images"
--   ON appointment_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- CREATE INDEX IF NOT EXISTS idx_appointment_images_appointment_id ON appointment_images(appointment_id);

-- ============================================================
-- STORAGE: appointment-images bucket (public) + RLS (run once)
-- ============================================================
-- insert into storage.buckets (id, name, public)
--   values ('appointment-images', 'appointment-images', true)
--   on conflict (id) do nothing;
--
-- drop policy if exists "Public read access to appointment images" on storage.objects;
-- create policy "Public read access to appointment images" on storage.objects
--   for select using (bucket_id = 'appointment-images');
-- drop policy if exists "Authenticated users can upload appointment images" on storage.objects;
-- create policy "Authenticated users can upload appointment images" on storage.objects
--   for insert to authenticated with check (bucket_id = 'appointment-images');
-- drop policy if exists "Authenticated users can update appointment images" on storage.objects;
-- create policy "Authenticated users can update appointment images" on storage.objects
--   for update to authenticated using (bucket_id = 'appointment-images');
-- drop policy if exists "Authenticated users can delete appointment images" on storage.objects;
-- create policy "Authenticated users can delete appointment images" on storage.objects
--   for delete to authenticated using (bucket_id = 'appointment-images');

-- ============================================================
-- HOW TO CREATE YOUR 4 USERS:
-- Go to Supabase Dashboard → Authentication → Users → Add User
-- Create 4 users with email + password
-- To set display name: after creating, update user metadata:
--
-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{full_name}', '"Abderrahim"')
-- WHERE email = 'abderrahim@example.com';
-- ============================================================
