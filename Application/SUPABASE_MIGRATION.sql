-- ============================================
-- Crop Disease Identifier - Database Schema
-- v2 (Corrected & Improved)
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
  name text NOT NULL UNIQUE, -- Added UNIQUE constraint for safety
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
  -- IMPROVEMENT: Added ON DELETE SET NULL. If a crop is deleted, old scans are kept but unlinked.
  crop_id uuid REFERENCES crops(id) ON DELETE SET NULL,
  image_url text,
  prediction jsonb,
  confidence numeric,
  notes text,
  is_low_conf boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Disease Solutions (Search Feature)
CREATE TABLE IF NOT EXISTS public.disease_solutions (
  id bigint generated always as identity primary key,
  name text not null UNIQUE, -- Added UNIQUE constraint for safety
  common_names text[] null,
  description text null,
  solutions text[] null,
  created_at timestamptz default now()
);

-- Products for organic/inorganic medicines
CREATE TABLE IF NOT EXISTS public.products (
  id bigint generated always as identity primary key,
  name text not null UNIQUE, -- Added UNIQUE constraint for safety
  -- IMPROVEMENT: Added a CHECK constraint for data integrity.
  category text not null CHECK (category IN ('organic', 'inorganic')),
  target_diseases text[] null,
  description text null,
  price numeric(10,2) null,
  image_url text null,
  created_at timestamptz default now()
);


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans (user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disease_solutions_name ON public.disease_solutions USING gin (to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_disease_solutions_desc ON public.disease_solutions USING gin (to_tsvector('simple', description));
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products USING gin (to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_products_desc ON public.products USING gin (to_tsvector('simple', description));

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------
-- PROFILES POLICIES (idempotent)
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

-- Read-only policies for solutions/products
DROP POLICY IF EXISTS "Authenticated users can read solutions." ON public.disease_solutions;
CREATE POLICY "Authenticated users can read solutions." ON public.disease_solutions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read products." ON public.products;
CREATE POLICY "Authenticated users can read products." ON public.products FOR SELECT TO authenticated USING (true);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample crops
INSERT INTO crops (name, scientific_name) VALUES
  ('Tomato', 'Solanum lycopersicum'),
  ('Okra', 'Abelmoschus esculentus')
ON CONFLICT (name) DO NOTHING;

-- Insert sample diseases for Tomato
INSERT INTO diseases (crop_id, name, description, remedies)
SELECT id, 'Healthy', 'Plant appears healthy with no visible disease symptoms.', '["Continue regular watering and fertilization", "Monitor for any changes", "Maintain good air circulation"]'::jsonb FROM crops WHERE name = 'Tomato'
ON CONFLICT DO NOTHING;

INSERT INTO diseases (crop_id, name, description, remedies)
SELECT id, 'Early Blight', 'Fungal disease causing dark spots with concentric rings on older leaves.', '["Remove and destroy infected leaves", "Apply fungicide containing chlorothalonil", "Improve air circulation", "Avoid overhead watering", "Rotate crops yearly"]'::jsonb FROM crops WHERE name = 'Tomato'
ON CONFLICT DO NOTHING;

INSERT INTO diseases (crop_id, name, description, remedies)
SELECT id, 'Late Blight', 'Serious disease causing water-soaked spots that turn brown and spread rapidly.', '["Remove infected plants immediately", "Apply copper-based fungicide", "Ensure good drainage", "Space plants properly", "Avoid working with wet plants"]'::jsonb FROM crops WHERE name = 'Tomato'
ON CONFLICT DO NOTHING;

-- Seed disease solutions
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
ON CONFLICT (name) DO NOTHING;

-- Seed sample medicines
INSERT INTO public.products (name, category, target_diseases, description, price, image_url) VALUES
('Neem Oil', 'organic', ARRAY['Early Blight','Leaf Spot','Powdery Mildew'], 'Broad-spectrum organic pesticide/fungicide derived from neem seeds.', 299.00, NULL),
('Bacillus subtilis Spray', 'organic', ARRAY['Leaf Spot','Downy Mildew'], 'Beneficial bacteria-based bio-fungicide that suppresses foliar diseases.', 349.00, NULL),
('Copper Oxychloride', 'inorganic', ARRAY['Bacterial Spot','Late Blight','Leaf Spot'], 'Inorganic copper fungicide effective against many bacterial/fungal diseases.', 399.00, NULL),
('Sulfur Dust', 'inorganic', ARRAY['Powdery Mildew'], 'Traditional sulfur-based fungicide for powdery mildew.', 199.00, NULL),
('Trichoderma Viride', 'organic', ARRAY['Fusarium Wilt','Verticillium Wilt'], 'Beneficial fungus for soil-borne disease suppression.', 379.00, NULL),
('Phosphonate Systemic', 'inorganic', ARRAY['Downy Mildew','Late Blight'], 'Systemic phosphonate fungicide; improves plant defenses.', 429.00, NULL),
('Potassium Bicarbonate', 'inorganic', ARRAY['Powdery Mildew'], 'Contact fungicide that disrupts fungal cell walls; safe profile.', 259.00, NULL),
('Seaweed Extract', 'organic', ARRAY['General'], 'Organic biostimulant improving vigor and stress tolerance.', 219.00, NULL),
('Chlorothalonil', 'inorganic', ARRAY['Early Blight','Leaf Spot'], 'Broad-spectrum contact fungicide for foliar diseases.', 449.00, NULL),
('Garlic Extract Spray', 'organic', ARRAY['General','Leaf Spot'], 'Natural antimicrobial/repellent properties for mild disease pressure.', 189.00, NULL),
('Copper Hydroxide', 'inorganic', ARRAY['Bacterial Spot','Leaf Spot'], 'Copper hydroxide formulation for bacterial/fungal leaf diseases.', 409.00, NULL),
('Compost Tea', 'organic', ARRAY['General','Leaf Spot'], 'Microbial-rich tea to enhance leaf/soil microbiome.', 149.00, NULL)
ON CONFLICT (name) DO NOTHING;
