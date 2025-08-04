-- Create themes table for homepage theme management
CREATE TABLE public.themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  hero_config JSON,
  layout_config JSON,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Themes are viewable by everyone" 
ON public.themes 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage themes" 
ON public.themes 
FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM public.profiles WHERE role = 'admin'
));

-- Create products categories table
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.product_categories(id),
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" 
ON public.product_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only admins can manage categories" 
ON public.product_categories 
FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM public.profiles WHERE role = 'admin'
));

-- Update existing products table to enhance structure
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'Rheem';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS model_number TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications JSON;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS installation_manual_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gallery_images JSON;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS quote_available BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'In Stock';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meta_keywords TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create floating chat config table
CREATE TABLE public.chat_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp_number TEXT NOT NULL DEFAULT '+2348123647982',
  welcome_message TEXT DEFAULT 'Hi EINSPOT, I need assistance with',
  is_enabled BOOLEAN DEFAULT true,
  position TEXT DEFAULT 'bottom-right',
  theme_color TEXT DEFAULT '#25D366',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for chat config
ALTER TABLE public.chat_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat config is viewable by everyone" 
ON public.chat_config 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage chat config" 
ON public.chat_config 
FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM public.profiles WHERE role = 'admin'
));

-- Insert default themes
INSERT INTO public.themes (name, description, hero_config, layout_config, is_active) VALUES 
(
  'Theme One - Current', 
  'Current homepage design with energy industry focus',
  '{
    "style": "gradient_overlay",
    "background_type": "image",
    "title": "Powering Nigeria''s Energy Future",
    "subtitle": "Leading provider of renewable energy solutions, HVAC systems, and sustainable technologies for homes, businesses, and industries across Nigeria.",
    "cta_buttons": [
      {"text": "Explore Products", "link": "/products", "style": "primary"},
      {"text": "Watch Demo", "link": "#", "style": "outline"}
    ],
    "stats": [
      {"value": "500+", "label": "Projects Completed"},
      {"value": "50MW+", "label": "Energy Generated"},
      {"value": "15+", "label": "Years Experience"},
      {"value": "24/7", "label": "Support Available"}
    ]
  }',
  '{
    "sections": ["hero", "about", "services", "products", "blog", "contact"],
    "hero_height": "min-h-screen",
    "section_spacing": "py-16"
  }',
  true
),
(
  'Theme Two - Modern', 
  'Modern design inspired by property/real estate layout with clean sections',
  '{
    "style": "split_layout",
    "background_type": "image",
    "title": "Homes That Match Your Vision",
    "subtitle": "Experience premium HVAC and engineering solutions designed for modern Nigerian homes and businesses.",
    "cta_buttons": [
      {"text": "Explore", "link": "/products", "style": "dark"},
      {"text": "Get Quote", "link": "#quote", "style": "light"}
    ],
    "stats": [
      {"value": "100+", "label": "Premium Installations"},
      {"value": "43,000+", "label": "Satisfied Customers"},
      {"value": "30+", "label": "Cities Covered"}
    ]
  }',
  '{
    "sections": ["hero", "experience", "properties", "services", "guarantee", "process", "testimonials"],
    "hero_height": "h-screen",
    "section_spacing": "py-24"
  }',
  false
);

-- Insert default product categories
INSERT INTO public.product_categories (name, slug, description, sort_order) VALUES 
('HVAC Systems', 'hvac-systems', 'Heating, Ventilation, and Air Conditioning solutions', 1),
('Water Heaters', 'water-heaters', 'Electric, gas, and hybrid water heating systems', 2),
('Plumbing Products', 'plumbing-products', 'Pipes, fittings, pumps, and water management systems', 3),
('Fire Safety Equipment', 'fire-safety', 'Fire suppression, sprinkler systems, and safety equipment', 4),
('Electrical Systems', 'electrical-systems', 'Panels, breakers, and electrical accessories', 5),
('Smart Building Automation', 'building-automation', 'BMS, IoT systems, and smart controls', 6);

-- Insert subcategories for HVAC
INSERT INTO public.product_categories (name, slug, description, parent_id, sort_order) VALUES 
('Split Air Conditioners', 'split-air-conditioners', 'Ductless split AC systems', 
  (SELECT id FROM public.product_categories WHERE slug = 'hvac-systems'), 1),
('VRF Systems', 'vrf-systems', 'Variable Refrigerant Flow systems', 
  (SELECT id FROM public.product_categories WHERE slug = 'hvac-systems'), 2),
('Rooftop Units', 'rooftop-units', 'Commercial rooftop HVAC units', 
  (SELECT id FROM public.product_categories WHERE slug = 'hvac-systems'), 3);

-- Insert subcategories for Water Heaters
INSERT INTO public.product_categories (name, slug, description, parent_id, sort_order) VALUES 
('Electric Storage', 'electric-storage', 'Electric tank water heaters', 
  (SELECT id FROM public.product_categories WHERE slug = 'water-heaters'), 1),
('Tankless', 'tankless', 'On-demand tankless water heaters', 
  (SELECT id FROM public.product_categories WHERE slug = 'water-heaters'), 2),
('Hybrid Systems', 'hybrid-systems', 'Heat pump hybrid water heaters', 
  (SELECT id FROM public.product_categories WHERE slug = 'water-heaters'), 3);

-- Insert default chat config
INSERT INTO public.chat_config (whatsapp_number, welcome_message, is_enabled) VALUES 
('+2348123647982', 'Hi EINSPOT, I need assistance with', true);

-- Add triggers for timestamps
CREATE TRIGGER update_themes_updated_at
BEFORE UPDATE ON public.themes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.product_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_config_updated_at
BEFORE UPDATE ON public.chat_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();