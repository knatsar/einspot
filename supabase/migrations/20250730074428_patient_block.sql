-- Migration to create complete EINSPOT database schema
-- This migration creates all necessary tables and policies for the EINSPOT application

-- Create profiles table for additional user information (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  location TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'superadmin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to profiles if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company') THEN
    ALTER TABLE public.profiles ADD COLUMN company TEXT;
  END IF;
END $$;

-- Create products table (if not exists)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2),
  image_url TEXT,
  gallery_images TEXT[],
  specifications JSONB,
  is_active BOOLEAN DEFAULT true,
  show_price BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  brand TEXT DEFAULT 'Rheem',
  model_number TEXT,
  features TEXT,
  installation_manual_url TEXT,
  quote_available BOOLEAN DEFAULT true,
  stock_status TEXT DEFAULT 'In Stock',
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to products if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'show_price') THEN
    ALTER TABLE public.products ADD COLUMN show_price BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_featured') THEN
    ALTER TABLE public.products ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand') THEN
    ALTER TABLE public.products ADD COLUMN brand TEXT DEFAULT 'Rheem';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'model_number') THEN
    ALTER TABLE public.products ADD COLUMN model_number TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'features') THEN
    ALTER TABLE public.products ADD COLUMN features TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_status') THEN
    ALTER TABLE public.products ADD COLUMN stock_status TEXT DEFAULT 'In Stock';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'meta_title') THEN
    ALTER TABLE public.products ADD COLUMN meta_title TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'meta_description') THEN
    ALTER TABLE public.products ADD COLUMN meta_description TEXT;
  END IF;
END $$;

-- Create quotations table (if not exists)
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'quoted', 'approved', 'rejected')),
  admin_notes TEXT,
  quoted_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table (if not exists)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES public.quotations(id),
  order_number TEXT UNIQUE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table (if not exists)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog_posts table (if not exists)
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category TEXT,
  tags TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT false,
  author_id UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table for portfolio (if not exists)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  client_name TEXT,
  location TEXT,
  category TEXT,
  featured_image TEXT,
  gallery_images TEXT[],
  completion_date DATE,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  excerpt TEXT,
  client TEXT,
  status TEXT DEFAULT 'completed',
  duration TEXT,
  technology_used TEXT,
  project_summary TEXT,
  process_overview TEXT,
  key_features TEXT,
  client_feedback TEXT,
  client_feedback_author TEXT,
  focus_keyphrase TEXT,
  meta_description TEXT,
  keyphrase_slug TEXT,
  synonyms TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to projects if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'tags') THEN
    ALTER TABLE public.projects ADD COLUMN tags TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'excerpt') THEN
    ALTER TABLE public.projects ADD COLUMN excerpt TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'client') THEN
    ALTER TABLE public.projects ADD COLUMN client TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'status') THEN
    ALTER TABLE public.projects ADD COLUMN status TEXT DEFAULT 'completed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'project_summary') THEN
    ALTER TABLE public.projects ADD COLUMN project_summary TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'client_feedback') THEN
    ALTER TABLE public.projects ADD COLUMN client_feedback TEXT;
  END IF;
END $$;

-- Create themes table for dynamic theming (if not exists)
CREATE TABLE IF NOT EXISTS public.themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  hero_config JSON,
  layout_config JSON,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_sections table (if not exists)
CREATE TABLE IF NOT EXISTS public.content_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  image_url TEXT,
  button_text TEXT,
  button_link TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_sections ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE profiles.user_id = $1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Superadmins can manage profiles" ON public.profiles
  FOR ALL USING (public.get_user_role(auth.uid()) = 'superadmin');

-- Drop and recreate product policies
DROP POLICY IF EXISTS "Everyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

CREATE POLICY "Everyone can view active products" ON public.products
  FOR SELECT USING (is_active = true OR public.get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Superadmins can manage products" ON public.products
  FOR ALL USING (public.get_user_role(auth.uid()) = 'superadmin');

-- Drop and recreate quotation policies
DROP POLICY IF EXISTS "Users can view their own quotations" ON public.quotations;
DROP POLICY IF EXISTS "Users can create quotations" ON public.quotations;
DROP POLICY IF EXISTS "Users can update their pending quotations" ON public.quotations;
DROP POLICY IF EXISTS "Admins can manage all quotations" ON public.quotations;

CREATE POLICY "Users can view their own quotations" ON public.quotations
  FOR SELECT USING (auth.uid() = customer_id OR public.get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Users can create quotations" ON public.quotations
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their pending quotations" ON public.quotations
  FOR UPDATE USING (auth.uid() = customer_id AND status = 'pending');

CREATE POLICY "Superadmins can manage all quotations" ON public.quotations
  FOR ALL USING (public.get_user_role(auth.uid()) = 'superadmin');

-- Drop and recreate other policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = customer_id OR public.get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Superadmins can manage all orders" ON public.orders
  FOR ALL USING (public.get_user_role(auth.uid()) = 'superadmin');

-- Order items policies
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;

CREATE POLICY "Users can view their order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.customer_id = auth.uid() OR public.get_user_role(auth.uid()) = 'superadmin')
    )
  );

CREATE POLICY "Superadmins can manage order items" ON public.order_items
  FOR ALL USING (public.get_user_role(auth.uid()) = 'superadmin');

-- Blog posts policies
DROP POLICY IF EXISTS "Everyone can view published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;

CREATE POLICY "Everyone can view published posts" ON public.blog_posts
  FOR SELECT USING (is_published = true OR public.get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Superadmins can manage blog posts" ON public.blog_posts
  FOR ALL USING (public.get_user_role(auth.uid()) = 'superadmin');

-- Projects policies
DROP POLICY IF EXISTS "Everyone can view projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;

CREATE POLICY "Everyone can view projects" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Superadmins can manage projects" ON public.projects
  FOR ALL USING (public.get_user_role(auth.uid()) = 'superadmin');

-- Themes policies
DROP POLICY IF EXISTS "Themes are viewable by everyone" ON public.themes;
DROP POLICY IF EXISTS "Only superadmins can manage themes" ON public.themes;

CREATE POLICY "Themes are viewable by everyone" ON public.themes
  FOR SELECT USING (true);

CREATE POLICY "Only superadmins can manage themes" ON public.themes
  FOR ALL USING (public.get_user_role(auth.uid()) = 'superadmin');

-- Content sections policies
DROP POLICY IF EXISTS "Everyone can view active content sections" ON public.content_sections;
DROP POLICY IF EXISTS "Superadmins can manage content sections" ON public.content_sections;

CREATE POLICY "Everyone can view active content sections" ON public.content_sections
  FOR SELECT USING (is_active = true OR public.get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Superadmins can manage content sections" ON public.content_sections
  FOR ALL USING (public.get_user_role(auth.uid()) = 'superadmin');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates (if not exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
    CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON public.products
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_quotations_updated_at') THEN
    CREATE TRIGGER update_quotations_updated_at
      BEFORE UPDATE ON public.quotations
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
    CREATE TRIGGER update_orders_updated_at
      BEFORE UPDATE ON public.orders
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_blog_posts_updated_at') THEN
    CREATE TRIGGER update_blog_posts_updated_at
      BEFORE UPDATE ON public.blog_posts
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
    CREATE TRIGGER update_projects_updated_at
      BEFORE UPDATE ON public.projects
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_themes_updated_at') THEN
    CREATE TRIGGER update_themes_updated_at
      BEFORE UPDATE ON public.themes
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_content_sections_updated_at') THEN
    CREATE TRIGGER update_content_sections_updated_at
      BEFORE UPDATE ON public.content_sections
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email IN ('admin@einspot.com', 'superadmin@einspot.com') THEN 'superadmin'
      ELSE 'customer'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'EINSPOT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers (if not exists)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Insert default themes (if not exist)
INSERT INTO public.themes (name, description, hero_config, layout_config, is_active)
VALUES 
(
  'EINSPOT Professional',
  'Professional theme for EINSPOT engineering solutions',
  '{
    "style": "gradient_dynamic",
    "background_type": "gradient",
    "title": "Engineering Nigeria''s Infrastructure Future",
    "subtitle": "Leading provider of MEP engineering solutions and Rheem certified systems across Nigeria",
    "cta_buttons": [
      {"text": "Explore Products", "link": "/products", "style": "primary"},
      {"text": "Get Quote", "link": "#contact", "style": "outline"}
    ],
    "stats": [
      {"value": "1000+", "label": "Projects Completed"},
      {"value": "36", "label": "States Covered"},
      {"value": "20+", "label": "Years Experience"},
      {"value": "100%", "label": "Rheem Certified"}
    ]
  }',
  '{
    "padding": "4rem",
    "alignment": "center",
    "maxWidth": "1280px"
  }',
  true
)
ON CONFLICT (name) DO NOTHING;

-- Insert sample products (if not exist)
INSERT INTO public.products (name, description, category, price, image_url, specifications, is_active, show_price, brand, features) VALUES
('Rheem Commercial Water Heater', 'High-efficiency commercial water heating system for large buildings and industrial applications', 'Water Heaters', 450000.00, 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800', '{"capacity": "500L", "efficiency": "95%", "voltage": "380V", "warranty": "5 years"}', true, true, 'Rheem', 'Energy efficient design\nCommercial grade durability\nSmart temperature controls\nEasy maintenance access'),
('Industrial HVAC System', 'Complete HVAC solution for industrial facilities with advanced climate control', 'HVAC Systems', 750000.00, 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800', '{"cooling": "100 tons", "heating": "Gas fired", "controls": "BMS integrated", "warranty": "3 years"}', true, false, 'Rheem', 'BMS integration ready\nZone-based climate control\nEnergy recovery systems\nRemote monitoring capability'),
('Water Treatment Plant', 'Advanced water purification system for industrial and commercial use', 'Water Treatment', null, 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800', '{"capacity": "50000L/day", "filtration": "Multi-stage RO", "automation": "PLC controlled", "compliance": "NAFDAC approved"}', true, false, 'Rheem', 'Multi-stage filtration\nPLC automated controls\nNAFDAC compliance\n24/7 monitoring system'),
('Solar Power System', 'Complete solar energy solution with battery backup and grid integration', 'Solar Energy', 1200000.00, 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800', '{"power": "50kW", "battery": "200kWh", "panels": "Monocrystalline", "warranty": "25 years"}', true, true, 'Rheem', 'Grid-tie capability\nBattery backup system\nSmart energy management\nRemote monitoring'),
('Heat Pump System', 'Energy-efficient heat pump for heating and cooling applications', 'HVAC Systems', 320000.00, 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800', '{"capacity": "25kW", "efficiency": "COP 4.5", "refrigerant": "R410A", "warranty": "5 years"}', true, true, 'Rheem', 'Dual heating/cooling\nHigh efficiency rating\nQuiet operation\nSmart controls'),
('Backup Generator', 'Diesel backup generator system for continuous power supply', 'Power Systems', null, 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800', '{"power": "500kVA", "fuel": "Diesel", "runtime": "48hrs", "automation": "Auto start/stop"}', true, false, 'Rheem', 'Automatic transfer switch\nRemote monitoring\nFuel efficient operation\nWeatherproof enclosure')
ON CONFLICT (name) DO NOTHING;

-- Insert sample projects (if not exist)
INSERT INTO public.projects (title, description, client_name, location, category, featured_image, completion_date, is_featured, excerpt, status, project_summary, client_feedback, client_feedback_author) VALUES
('NDDC HVAC Installation - Bayelsa', 'Complete HVAC system installation for NDDC facility in Bayelsa State', 'Niger Delta Development Commission', 'Yenagoa, Bayelsa State', 'Government Projects / HVAC Engineering', 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800', '2024-08-15', true, 'Multi-zone HVAC system installation for government facility with advanced climate control and energy efficiency features.', 'completed', 'EINSPOT successfully delivered a comprehensive HVAC solution for the Niger Delta Development Commission facility in Bayelsa State. The project involved the installation of a multi-zone climate control system designed to maintain optimal environmental conditions across the entire facility while maximizing energy efficiency.', 'EINSPOT delivered exceptional service throughout the project. Their technical expertise and attention to detail ensured our facility now operates with optimal climate control and energy efficiency.', 'Engr. Dimeji Okafor, NDDC Bayelsa Facility Manager'),
('Lagos Commercial Complex HVAC', 'Central air conditioning system for 15-story commercial building in Victoria Island', 'Lagos Commercial Properties Ltd', 'Victoria Island, Lagos', 'Commercial HVAC', 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800', '2024-06-20', true, 'Large-scale commercial HVAC installation with smart building integration and energy management systems.', 'completed', 'A sophisticated HVAC system installation for a 15-story commercial complex, featuring intelligent climate zones, energy recovery systems, and integration with the building management system for optimal performance and energy savings.', 'The HVAC system has significantly improved our building''s energy efficiency and tenant comfort. EINSPOT''s professional approach and quality installation exceeded our expectations.', 'Mrs. Adunni Adebayo, Property Manager'),
('Abuja Hospital Water Treatment', 'Medical-grade water treatment system for 200-bed teaching hospital', 'University of Abuja Teaching Hospital', 'Gwagwalada, Abuja', 'Healthcare / Water Treatment', 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800', '2024-04-10', false, 'Medical-grade water purification system ensuring safe, clean water supply for critical healthcare operations.', 'completed', 'Installation of a comprehensive water treatment system meeting strict medical standards, providing purified water for surgical procedures, laboratory operations, and general hospital use with 24/7 monitoring and backup systems.', 'EINSPOT provided a world-class water treatment solution that meets all our medical standards. The system reliability is excellent and maintenance support is outstanding.', 'Dr. Ibrahim Suleiman, Chief Medical Director'),
('Port Harcourt Industrial Power', 'Backup power systems for oil and gas processing facility', 'Shell Petroleum Development Company', 'Port Harcourt, Rivers State', 'Oil & Gas / Power Systems', 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800', '2024-09-30', true, 'Critical backup power infrastructure for oil and gas operations with redundant systems and remote monitoring.', 'completed', 'Design and installation of redundant backup power systems for critical oil and gas operations, including automatic transfer switches, UPS systems, and diesel generators with advanced monitoring and control systems.', 'EINSPOT delivered a robust power solution that ensures our operations never experience downtime. Their technical expertise in critical power systems is impressive.', 'Engr. Chuka Nwankwo, Operations Manager')
ON CONFLICT (title) DO NOTHING;

-- Insert sample blog posts (if not exist)
INSERT INTO public.blog_posts (title, slug, excerpt, content, featured_image, category, tags, meta_title, meta_description, is_published) VALUES
('HVAC Energy Efficiency in Nigerian Commercial Buildings', 'hvac-energy-efficiency-nigerian-buildings', 'Learn how to optimize HVAC systems for energy efficiency in Nigeria''s tropical climate while maintaining optimal comfort levels.', 'Nigeria''s tropical climate presents unique challenges for HVAC systems in commercial buildings. This comprehensive guide explores proven strategies for maximizing energy efficiency while maintaining optimal comfort levels...', 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800', 'HVAC Engineering', ARRAY['hvac', 'energy efficiency', 'commercial buildings', 'nigeria'], 'HVAC Energy Efficiency in Nigerian Commercial Buildings - EINSPOT', 'Complete guide to optimizing HVAC systems for energy efficiency in Nigeria''s commercial buildings and tropical climate.', true),
('Water Treatment Standards for Healthcare Facilities', 'water-treatment-healthcare-facilities', 'Understanding the critical requirements for medical-grade water treatment systems in Nigerian healthcare facilities.', 'Healthcare facilities require the highest standards of water quality for patient safety and medical procedures. This article outlines the essential requirements and best practices for water treatment in Nigerian hospitals and clinics...', 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800', 'Water Treatment', ARRAY['water treatment', 'healthcare', 'medical facilities', 'safety standards'], 'Water Treatment Standards for Healthcare Facilities - EINSPOT', 'Essential guide to medical-grade water treatment requirements for Nigerian healthcare facilities and hospitals.', true)
ON CONFLICT (slug) DO NOTHING;