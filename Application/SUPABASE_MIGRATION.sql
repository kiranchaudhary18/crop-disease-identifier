-- ============================================
-- Crop Disease Identifier - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  phone text,
  preferred_language text DEFAULT 'hi',
  created_at timestamptz DEFAULT now()
);

-- Crops table
CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  scientific_name text,
  created_at timestamptz DEFAULT now()
);

-- Diseases table
CREATE TABLE IF NOT EXISTS diseases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  remedies jsonb,
  created_at timestamptz DEFAULT now()
);

-- Scans (history)
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  crop_id uuid REFERENCES crops(id),
  image_url text,
  prediction jsonb,
  confidence numeric,
  notes text,
  is_low_conf boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans (user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans (created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------
-- PROFILES POLICIES (FIXED: Added DROP POLICY)
-- --------------------------------------------

-- Drop policies if they already exist to avoid '42710' error
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Profiles policies
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Crops policies (read-only for authenticated users)
DROP POLICY IF EXISTS "Authenticated users can view crops" ON crops;
CREATE POLICY "Authenticated users can view crops"
  ON crops FOR SELECT
  TO authenticated
  USING (true);

-- Diseases policies (read-only for authenticated users)
DROP POLICY IF EXISTS "Authenticated users can view diseases" ON diseases;
CREATE POLICY "Authenticated users can view diseases"
  ON diseases FOR SELECT
  TO authenticated
  USING (true);

-- Scans policies
DROP POLICY IF EXISTS "Users can insert own scans" ON scans;
DROP POLICY IF EXISTS "Users can view own scans" ON scans;
DROP POLICY IF EXISTS "Users can update own scans" ON scans;

CREATE POLICY "Users can insert own scans"
  ON scans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own scans"
  ON scans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
  ON scans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample crops
INSERT INTO crops (name, scientific_name) VALUES
  ('Tomato', 'Solanum lycopersicum'),
  ('Okra', 'Abelmoschus esculentus')
ON CONFLICT DO NOTHING;

-- Insert sample diseases for Tomato
INSERT INTO diseases (crop_id, name, description, remedies)
SELECT
  c.id,
  'Healthy',
  'Plant appears healthy with no visible disease symptoms.',
  '["Continue regular watering and fertilization", "Monitor for any changes", "Maintain good air circulation"]'::jsonb
FROM crops c WHERE c.name = 'Tomato'
ON CONFLICT DO NOTHING;

INSERT INTO diseases (crop_id, name, description, remedies)
SELECT
  c.id,
  'Early Blight',
  'Fungal disease causing dark spots with concentric rings on older leaves.',
  '["Remove and destroy infected leaves", "Apply fungicide containing chlorothalonil", "Improve air circulation", "Avoid overhead watering", "Rotate crops yearly"]'::jsonb
FROM crops c WHERE c.name = 'Tomato'
ON CONFLICT DO NOTHING;

INSERT INTO diseases (crop_id, name, description, remedies)
SELECT
  c.id,
  'Late Blight',
  'Serious disease causing water-soaked spots that turn brown and spread rapidly.',
  '["Remove infected plants immediately", "Apply copper-based fungicide", "Ensure good drainage", "Space plants properly", "Avoid working with wet plants"]'::jsonb
FROM crops c WHERE c.name = 'Tomato'
ON CONFLICT DO NOTHING;

-- ============================================
-- STORAGE BUCKET SETUP (Manual)
-- ============================================

-- Note: Storage bucket setup is manual.
-- Go to Supabase Dashboard > Storage
-- 1. Create a new bucket named: scans
-- 2. Set visibility to: Private

-- ============================================
-- Disease Solutions (Search Feature)
-- ============================================

CREATE TABLE IF NOT EXISTS public.disease_solutions (
  id bigint generated always as identity primary key,
  name text not null,
  common_names text[] null,
  description text null,
  solutions text[] null,
  created_at timestamptz default now()
);

-- Indexes for faster ilike/text search
CREATE INDEX IF NOT EXISTS idx_disease_solutions_name ON public.disease_solutions USING gin (to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_disease_solutions_desc ON public.disease_solutions USING gin (to_tsvector('simple', description));

-- RLS: allow read for authenticated users
ALTER TABLE public.disease_solutions ENABLE ROW LEVEL SECURITY;

-- Policy creation using conditional block (already good, no change needed here)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'disease_solutions' AND policyname = 'Allow read to authenticated'
  ) THEN
    CREATE POLICY "Allow read to authenticated" ON public.disease_solutions
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Seed 10 dummy rows (Added ON CONFLICT DO NOTHING for safety)
INSERT INTO public.disease_solutions (name, common_names, description, solutions) VALUES
('Early Blight', ARRAY['Alternaria blight'], 'Dark concentric spots on older leaves of tomato/potato.', ARRAY['Remove infected leaves','Use chlorothalonil fungicide','Avoid overhead watering']),
('Late Blight', ARRAY['Phytophthora blight'], 'Water-soaked lesions that spread rapidly in cool wet weather.', ARRAY['Destroy infected plants','Apply copper-based fungicide','Ensure drainage']),
('Leaf Spot', ARRAY['Cercospora leaf spot'], 'Small dark spots with yellow halos on leaves.', ARRAY['Sanitize tools','Apply appropriate fungicide','Improve air circulation']),
('Powdery Mildew', ARRAY['White mold'], 'White powdery growth on leaf surfaces.', ARRAY['Use sulfur spray','Increase spacing','Avoid excess nitrogen']),
('Downy Mildew', ARRAY['False mildew'], 'Yellow patches above, gray-purple growth below leaves.', ARRAY['Remove infected foliage','Use phosphonate fungicide','Water early in day']),
('Bacterial Spot', ARRAY['Xanthomonas spot'], 'Greasy-looking leaf spots and fruit lesions.', ARRAY['Copper sprays','Avoid working wet plants','Use resistant varieties']),
('Anthracnose', ARRAY['Colletotrichum rot'], 'Sunken dark lesions on fruits.', ARRAY['Harvest promptly','Mulch to reduce splash','Rotate crops']),
('Fusarium Wilt', ARRAY['Fusarium yellows'], 'Yellowing and wilting, often one side of plant.', ARRAY['Plant resistant cultivars','Solarize soil','Rotate out of host crops']),
('Verticillium Wilt', ARRAY['Vert wilt'], 'V-shaped chlorosis on older leaves, wilting.', ARRAY['Improve soil health','Use resistant varieties','Remove infected debris']),
('Healthy', ARRAY['No disease'], 'No visible symptoms; plant is healthy.', ARRAY['Maintain good practices','Balanced fertilizer','Monitor regularly'])
ON CONFLICT DO NOTHING;