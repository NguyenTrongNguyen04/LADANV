/*
  # LADANV Database Schema - Initial Setup
  
  ## Overview
  Complete database schema for LADANV skincare ingredient analysis platform
  
  ## New Tables
  
  ### 1. `user_profiles`
  User skincare and health profiles for personalization
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `skin_type` (text) - oily, dry, combination, sensitive, normal
  - `skin_concerns` (text[]) - acne, aging, pigmentation, etc.
  - `allergies` (text[]) - known ingredient allergies
  - `health_conditions` (text[]) - pregnancy, medical conditions
  - `goals` (text[]) - user skincare goals
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. `ingredients`
  Master ingredient database
  - `id` (uuid, primary key)
  - `name` (text, unique)
  - `name_vi` (text) - Vietnamese name
  - `description` (text) - simple explanation in Vietnamese
  - `functions` (text[]) - moisturizing, anti-aging, etc.
  - `safety_rating` (text) - good, neutral, caution, avoid
  - `concerns` (text[]) - potential side effects
  - `suitable_for` (text[]) - skin types it works for
  - `avoid_for` (text[]) - conditions/situations to avoid
  - `concentration_notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 3. `products`
  Product database
  - `id` (uuid, primary key)
  - `barcode` (text, unique)
  - `name` (text)
  - `brand` (text)
  - `category` (text) - cleanser, moisturizer, serum, etc.
  - `price` (numeric)
  - `image_url` (text)
  - `description` (text)
  - `full_ingredients_list` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 4. `product_ingredients`
  Junction table linking products to ingredients
  - `id` (uuid, primary key)
  - `product_id` (uuid, references products)
  - `ingredient_id` (uuid, references ingredients)
  - `position` (integer) - order in ingredient list
  - `concentration` (text) - if known
  - `created_at` (timestamptz)
  
  ### 5. `product_ratings`
  Product scores for different skin types
  - `id` (uuid, primary key)
  - `product_id` (uuid, references products)
  - `skin_type` (text)
  - `rating` (numeric) - 0-100 score
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 6. `user_products`
  Products saved/used by users
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `product_id` (uuid, references products)
  - `status` (text) - wishlist, using, discontinued
  - `started_at` (timestamptz)
  - `notes` (text)
  - `created_at` (timestamptz)
  
  ### 7. `skin_journal_entries`
  Daily skin tracking journal
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `entry_date` (date)
  - `skin_condition` (text) - good, fair, poor
  - `notes` (text)
  - `photo_url` (text)
  - `reactions` (text[]) - itching, redness, breakout, etc.
  - `products_used` (uuid[]) - array of product IDs
  - `created_at` (timestamptz)
  
  ### 8. `product_reviews`
  User reviews and ratings
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `product_id` (uuid, references products)
  - `rating` (integer) - 1-5 stars
  - `review_text` (text)
  - `effectiveness_rating` (integer) - 1-5
  - `days_used` (integer)
  - `verified` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 9. `user_alerts`
  Personalized alerts and warnings
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `alert_type` (text) - ingredient_warning, reminder, duplicate_function
  - `severity` (text) - info, warning, danger
  - `title` (text)
  - `message` (text)
  - `related_product_id` (uuid)
  - `related_ingredient_id` (uuid)
  - `is_read` (boolean)
  - `created_at` (timestamptz)
  
  ### 10. `user_routines`
  User skincare routines and schedules
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text) - morning, evening, weekly
  - `time_of_day` (text)
  - `products` (uuid[]) - ordered array of product IDs
  - `active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Public read access for ingredients and products
  - Authenticated users can read all reviews but only modify their own
  
  ## Indexes
  - Foreign key indexes for performance
  - Search indexes on product and ingredient names
  - User-specific data indexes
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  skin_type text CHECK (skin_type IN ('oily', 'dry', 'combination', 'sensitive', 'normal')),
  skin_concerns text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  health_conditions text[] DEFAULT '{}',
  goals text[] DEFAULT '{}',
  date_of_birth date,
  gender text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  name_vi text,
  description text,
  functions text[] DEFAULT '{}',
  safety_rating text DEFAULT 'neutral' CHECK (safety_rating IN ('good', 'neutral', 'caution', 'avoid')),
  concerns text[] DEFAULT '{}',
  suitable_for text[] DEFAULT '{}',
  avoid_for text[] DEFAULT '{}',
  concentration_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode text UNIQUE,
  name text NOT NULL,
  brand text,
  category text,
  price numeric,
  currency text DEFAULT 'VND',
  image_url text,
  description text,
  full_ingredients_list text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_ingredients junction table
CREATE TABLE IF NOT EXISTS product_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE CASCADE NOT NULL,
  position integer DEFAULT 0,
  concentration text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, ingredient_id)
);

-- Create product_ratings table
CREATE TABLE IF NOT EXISTS product_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  skin_type text NOT NULL,
  rating numeric CHECK (rating >= 0 AND rating <= 100),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, skin_type)
);

-- Create user_products table
CREATE TABLE IF NOT EXISTS user_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'wishlist' CHECK (status IN ('wishlist', 'using', 'discontinued')),
  started_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create skin_journal_entries table
CREATE TABLE IF NOT EXISTS skin_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_date date DEFAULT CURRENT_DATE NOT NULL,
  skin_condition text CHECK (skin_condition IN ('excellent', 'good', 'fair', 'poor')),
  notes text,
  photo_url text,
  reactions text[] DEFAULT '{}',
  products_used uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  effectiveness_rating integer CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  days_used integer DEFAULT 0,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create user_alerts table
CREATE TABLE IF NOT EXISTS user_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('ingredient_warning', 'reminder', 'duplicate_function', 'product_alert')),
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'danger')),
  title text NOT NULL,
  message text NOT NULL,
  related_product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  related_ingredient_id uuid REFERENCES ingredients(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create user_routines table
CREATE TABLE IF NOT EXISTS user_routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  time_of_day text CHECK (time_of_day IN ('morning', 'evening', 'weekly', 'custom')),
  products uuid[] DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_product_id ON product_ingredients(product_id);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_ingredient_id ON product_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_user_products_user_id ON user_products(user_id);
CREATE INDEX IF NOT EXISTS idx_user_products_product_id ON user_products(product_id);
CREATE INDEX IF NOT EXISTS idx_skin_journal_user_id ON skin_journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_skin_journal_entry_date ON skin_journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_user_id ON user_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_routines_user_id ON user_routines(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_routines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for ingredients (public read)
CREATE POLICY "Anyone can view ingredients"
  ON ingredients FOR SELECT
  TO public
  USING (true);

-- RLS Policies for products (public read)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO public
  USING (true);

-- RLS Policies for product_ingredients (public read)
CREATE POLICY "Anyone can view product ingredients"
  ON product_ingredients FOR SELECT
  TO public
  USING (true);

-- RLS Policies for product_ratings (public read)
CREATE POLICY "Anyone can view product ratings"
  ON product_ratings FOR SELECT
  TO public
  USING (true);

-- RLS Policies for user_products
CREATE POLICY "Users can view own products"
  ON user_products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON user_products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON user_products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON user_products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for skin_journal_entries
CREATE POLICY "Users can view own journal entries"
  ON skin_journal_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON skin_journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON skin_journal_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON skin_journal_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for product_reviews
CREATE POLICY "Anyone can view reviews"
  ON product_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert own reviews"
  ON product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON product_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON product_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_alerts
CREATE POLICY "Users can view own alerts"
  ON user_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON user_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON user_alerts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_routines
CREATE POLICY "Users can view own routines"
  ON user_routines FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines"
  ON user_routines FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines"
  ON user_routines FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines"
  ON user_routines FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);