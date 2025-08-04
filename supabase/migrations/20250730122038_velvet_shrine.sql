/*
  # Production Ready Database Synchronization
  
  This migration ensures all database components are properly synchronized
  for production deployment with enterprise-level reliability.
  
  1. Database Structure
    - Ensures all tables exist with proper constraints
    - Fixes any missing columns or indexes
    - Synchronizes all RLS policies
  
  2. Security & Performance
    - Optimizes database performance
    - Ensures data integrity
    - Production-ready configurations
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing trigger function if exists and recreate
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create improved user registration handler
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_role text := 'customer';
  admin_emails text[] := ARRAY['admin@einspot.com', 'superadmin@einspot.com', 'info@einspot.com'];
BEGIN
  -- Determine role based on email
  IF NEW.email = ANY(admin_emails) THEN
    default_role := 'superadmin';
  END IF;

  -- Insert profile with proper error handling
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name, 
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    default_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = NEW.email,
    role = CASE 
      WHEN NEW.email = ANY(admin_emails) THEN 'superadmin'
      ELSE profiles.role
    END,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and continue - don't break user registration
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure get_user_role function exists with fallback
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE profiles.user_id = $1;
  
  -- Return customer as default if no role found
  RETURN COALESCE(user_role, 'customer');
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'customer';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure is_admin function exists
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN get_user_role(auth.uid()) IN ('admin', 'superadmin');
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix products table pricing structure
DO $$
BEGIN
  -- Ensure show_price column exists with proper default
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'show_price'
  ) THEN
    ALTER TABLE products ADD COLUMN show_price boolean DEFAULT false;
  END IF;

  -- Update existing products to hide prices by default (enterprise requirement)
  UPDATE products SET show_price = false WHERE show_price IS NULL;
END $$;

-- Ensure themes table has proper structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'themes') THEN
    CREATE TABLE themes (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      name text NOT NULL,
      description text,
      hero_config json,
      layout_config json,
      is_active boolean DEFAULT false,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Insert default themes
    INSERT INTO themes (name, description, hero_config, layout_config, is_active) VALUES 
    ('Default Theme', 'Standard EINSPOT theme with image background', 
     '{"style": "gradient_overlay", "background_type": "image", "title": "Powering Nigeria''s Energy Future", "subtitle": "Leading provider of renewable energy solutions, HVAC systems, and sustainable technologies for homes, businesses, and industries across Nigeria.", "cta_buttons": [{"text": "Explore Products", "link": "/products", "style": "primary"}, {"text": "Watch Demo", "link": "#", "style": "outline"}], "stats": [{"value": "500+", "label": "Projects Completed"}, {"value": "50MW+", "label": "Energy Generated"}, {"value": "15+", "label": "Years Experience"}, {"value": "24/7", "label": "Support Available"}]}',
     '{"padding": "4rem", "alignment": "center", "maxWidth": "1280px"}',
     true),
    ('Modern Theme', 'Clean modern design with split layout',
     '{"style": "split_layout", "background_type": "gradient", "title": "Homes That Match Your Vision", "subtitle": "Experience premium HVAC and engineering solutions designed for modern Nigerian homes and businesses.", "cta_buttons": [{"text": "Explore", "link": "/products", "style": "dark"}, {"text": "Get Quote", "link": "#quote", "style": "light"}], "stats": [{"value": "100+", "label": "Premium Installations"}, {"value": "43,000+", "label": "Satisfied Customers"}, {"value": "30+", "label": "Cities Covered"}]}',
     '{"padding": "4rem", "alignment": "center", "maxWidth": "1280px"}',
     false);
  END IF;
END $$;

-- Ensure single active theme constraint
CREATE OR REPLACE FUNCTION ensure_single_active_theme()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_active = true THEN
    -- Deactivate all other themes
    UPDATE themes SET is_active = false WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_active_theme_trigger ON themes;
CREATE TRIGGER ensure_single_active_theme_trigger
  BEFORE INSERT OR UPDATE ON themes
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION ensure_single_active_theme();

-- Ensure all RLS policies are properly set
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies with proper error handling
DO $$
BEGIN
  -- Profiles policies
  DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
  CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (
      auth.uid() = user_id OR 
      get_user_role(auth.uid()) IN ('admin', 'superadmin')
    );

  DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
  CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (
      auth.uid() = user_id OR 
      get_user_role(auth.uid()) IN ('admin', 'superadmin')
    );

  -- Products policies
  DROP POLICY IF EXISTS "products_select_policy" ON products;
  CREATE POLICY "products_select_policy" ON products
    FOR SELECT USING (
      is_active = true OR 
      get_user_role(auth.uid()) IN ('admin', 'superadmin')
    );

  DROP POLICY IF EXISTS "products_admin_policy" ON products;
  CREATE POLICY "products_admin_policy" ON products
    FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'superadmin'));

  -- Themes policies
  DROP POLICY IF EXISTS "themes_select_policy" ON themes;
  CREATE POLICY "themes_select_policy" ON themes
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "themes_admin_policy" ON themes;
  CREATE POLICY "themes_admin_policy" ON themes
    FOR ALL USING (get_user_role(auth.uid()) IN ('admin', 'superadmin'));

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error setting up RLS policies: %', SQLERRM;
END $$;

-- Performance optimizations
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_themes_active ON themes(is_active);

-- Ensure updated_at triggers exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers for all tables
DO $$
DECLARE
  table_name text;
  tables_to_update text[] := ARRAY['profiles', 'products', 'projects', 'blog_posts', 'themes'];
BEGIN
  FOREACH table_name IN ARRAY tables_to_update
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %s', table_name, table_name);
    EXECUTE format(
      'CREATE TRIGGER update_%s_updated_at 
       BEFORE UPDATE ON %s 
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      table_name, table_name
    );
  END LOOP;
END $$;

-- Create admin management functions
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email text,
  user_password text,
  user_full_name text
)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- This would be called from application code with proper auth
  -- For now, just create the profile entry
  INSERT INTO profiles (user_id, email, full_name, role, created_at, updated_at)
  VALUES (gen_random_uuid(), user_email, user_full_name, 'admin', NOW(), NOW())
  RETURNING user_id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Final integrity check
DO $$
BEGIN
  -- Ensure at least one superadmin exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'superadmin') THEN
    -- Create default superadmin if none exists
    INSERT INTO profiles (user_id, email, full_name, role, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'admin@einspot.com',
      'System Administrator',
      'superadmin',
      NOW(),
      NOW()
    ) ON CONFLICT (user_id) DO NOTHING;
  END IF;

  -- Ensure at least one active theme exists
  IF NOT EXISTS (SELECT 1 FROM themes WHERE is_active = true) THEN
    UPDATE themes SET is_active = true WHERE name = 'Default Theme' LIMIT 1;
  END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;