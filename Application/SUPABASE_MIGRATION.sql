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
CREATE POLICY "Authenticated users can view crops"
  ON crops FOR SELECT
  TO authenticated
  USING (true);

-- Diseases policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view diseases"
  ON diseases FOR SELECT
  TO authenticated
  USING (true);

-- Scans policies
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

-- Go to Supabase Dashboard > Storage
-- 1. Create a new bucket named: scans
-- 2. Set visibility to: Private
-- 3. No additional policies needed (RLS handles access)
