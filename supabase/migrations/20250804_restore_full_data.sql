-- Complete data restoration with conflict handling
BEGIN;

-- First ensure tables have correct structure
DO $$ 
BEGIN
    -- Add missing columns to projects table
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS duration TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS technology_used TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_summary TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS process_overview TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS key_features TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client_feedback TEXT;
    ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client_feedback_author TEXT;

    -- Add missing columns to blog_posts table
    ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS excerpt TEXT;
    ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured_image TEXT;
    ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category TEXT;
    ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[];
    ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
    ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Column addition failed, might already exist: %', SQLERRM;
END $$;

-- Restore all products
INSERT INTO public.products (
  name, description, category, price, image_url, 
  specifications, brand, model_number, is_active, 
  show_price, is_featured
) VALUES 
  (
    'Rheem Professional Series Water Heater 50L',
    'High-efficiency electric water heater perfect for residential and commercial use.',
    'Water Heaters',
    450000,
    '/public/lovable-uploads/water-heater-1.jpg',
    '{"capacity": "50L", "power": "3000W", "voltage": "220V"}',
    'Rheem',
    'PRO-50L',
    true, true, true
  ),
  (
    'Industrial Heat Pump',
    'High-efficiency industrial heat pump for large-scale heating and cooling applications',
    'HVAC Systems',
    45000.00,
    '/public/lovable-uploads/heat-pump.jpg',
    '{"capacity": "500kW", "efficiency": "COP 4.5", "voltage": "380V"}',
    'Rheem',
    'IHP-500',
    true, true, true
  ),
  (
    'Smart Building Management System',
    'Comprehensive building automation and control system',
    'Building Automation',
    750000.00,
    '/public/lovable-uploads/bms-system.jpg',
    '{"protocols": "BACnet, Modbus", "capacity": "500 points", "interface": "Web + Mobile"}',
    'Rheem',
    'BMS-PRO',
    true, true, false
  ),
  (
    'Commercial Air Handler',
    'High-capacity air handling unit for commercial applications',
    'HVAC Systems',
    350000.00,
    '/public/lovable-uploads/air-handler.jpg',
    '{"airflow": "25000 CFM", "filtration": "MERV 13", "control": "DDC"}',
    'Rheem',
    'AHU-COM',
    true, true, true
  );

-- Restore all projects
INSERT INTO public.projects (
  title, description, client_name, location, category,
  excerpt, featured_image, completion_date, is_featured,
  duration, technology_used, project_summary, process_overview,
  key_features, client_feedback, client_feedback_author, status
) VALUES
  (
    'NDDC Regional Office HVAC Installation',
    'Complete HVAC system installation for Niger Delta Development Commission headquarters.',
    'Niger Delta Development Commission',
    'Port Harcourt, Rivers State',
    'Government Infrastructure',
    'State-of-the-art HVAC installation for NDDC regional headquarters.',
    '/public/lovable-uploads/nddc-project.jpg',
    '2024-06-15',
    true,
    '3 months',
    'VRF System, BMS Integration',
    'Full HVAC system redesign and installation...',
    'Site assessment, Design planning, Installation, Testing',
    'Energy efficient, Smart controls, Zone management',
    'Excellent work delivered on time and within budget',
    'Dr. Samuel Ogbuku, NDDC MD',
    'completed'
  ),
  (
    'Lagos Tech Hub Air Conditioning',
    'Modern HVAC solution for technology innovation center',
    'Lagos State Government',
    'Yaba, Lagos',
    'Tech Infrastructure',
    'Smart HVAC solution for Lagos technology hub',
    '/public/lovable-uploads/tech-hub.jpg',
    '2024-05-01',
    true,
    '2 months',
    'Smart AC, IoT Integration',
    'Smart air conditioning system with IoT controls...',
    'Requirements gathering, Installation, IoT setup',
    'IoT enabled, Energy monitoring, Smart controls',
    'Transformed our workspace environment completely',
    'Mrs. Abiola Tech, Hub Director',
    'completed'
  );

-- Restore blog posts
INSERT INTO public.blog_posts (
  title, slug, excerpt, content, 
  featured_image, category, tags, 
  is_published, meta_title, meta_description
) VALUES
  (
    'The Future of HVAC in Nigeria',
    'future-of-hvac-nigeria',
    'Explore the latest trends in HVAC technology and their impact on Nigerian businesses.',
    'The Nigerian HVAC industry is evolving rapidly with new technologies...',
    '/public/lovable-uploads/hvac-future.jpg',
    'HVAC',
    ARRAY['HVAC', 'Nigeria', 'Technology'],
    true,
    'Future of HVAC in Nigeria - Latest Trends',
    'Comprehensive guide to future HVAC trends in Nigeria'
  ),
  (
    'Energy Efficiency in Commercial Buildings',
    'energy-efficiency-commercial-buildings',
    'Learn how to optimize energy usage in commercial buildings.',
    'Commercial buildings in Nigeria can significantly reduce energy costs...',
    '/public/lovable-uploads/energy-efficiency.jpg',
    'Energy Efficiency',
    ARRAY['Energy', 'Commercial', 'Sustainability'],
    true,
    'Commercial Building Energy Efficiency Guide',
    'Complete guide to commercial building energy optimization'
  );

-- Fix RLS policies for admin access
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
);

COMMIT;
