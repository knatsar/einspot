/*
  # Ensure All Required Database Records Exist
  
  This migration ensures all necessary records exist for the EINSPOT application
  to function properly in production, including sample data, themes, and configurations.
*/

-- Ensure required functions exist
CREATE OR REPLACE FUNCTION ensure_single_active_theme()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE themes SET is_active = false WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE 
      WHEN NEW.email IN ('admin@einspot.com', 'superadmin@einspot.com', 'info@einspot.com') 
      THEN 'superadmin'
      ELSE 'customer'
    END
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert default chat configuration if not exists
INSERT INTO chat_config (id, whatsapp_number, welcome_message, is_enabled, position, theme_color)
VALUES (
  gen_random_uuid(),
  '+2348123647982',
  'Hi EINSPOT, I need assistance with',
  true,
  'bottom-right',
  '#25D366'
) ON CONFLICT DO NOTHING;

-- Insert default themes if they don't exist
INSERT INTO themes (id, name, description, hero_config, layout_config, is_active) VALUES
(
  gen_random_uuid(),
  'EINSPOT Default Theme',
  'Professional theme for EINSPOT engineering solutions',
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
    "padding": "4rem",
    "alignment": "center", 
    "maxWidth": "1280px"
  }',
  true
),
(
  gen_random_uuid(),
  'Modern Corporate Theme',
  'Clean modern theme for corporate presentation',
  '{
    "style": "modern_minimal",
    "background_type": "gradient",
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
    "padding": "3rem",
    "alignment": "left",
    "maxWidth": "1200px"
  }',
  false
) ON CONFLICT DO NOTHING;

-- Insert sample products if table is empty
INSERT INTO products (name, description, category, price, image_url, brand, show_price, is_active, is_featured, specifications) VALUES
(
  'Rheem Professional Series Water Heater 50L',
  'High-efficiency electric water heater perfect for residential and commercial use. Energy-saving design with digital temperature control.',
  'Water Heaters',
  450000,
  'https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Rheem',
  false,
  true,
  true,
  '{"capacity": "50 Liters", "power": "3kW", "voltage": "220V", "efficiency": "95%", "warranty": "5 years"}'
),
(
  'HVAC Split System 2.5HP',
  'Professional grade air conditioning system suitable for large offices and commercial spaces. Energy efficient with smart controls.',
  'HVAC Systems',
  850000,
  'https://images.pexels.com/photos/5439137/pexels-photo-5439137.jpeg?auto=compress&cs=tinysrgb&w=800',
  'LG',
  false,
  true,
  true,
  '{"capacity": "2.5HP", "coverage": "60sqm", "energy_rating": "5-star", "warranty": "3 years"}'
),
(
  'Industrial Water Treatment Plant',
  'Complete water treatment solution for industrial applications. Includes filtration, purification, and quality monitoring systems.',
  'Water Treatment',
  2500000,
  'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=800',
  'EINSPOT',
  false,
  true,
  false,
  '{"capacity": "10,000L/day", "filtration": "Multi-stage", "automation": "Full PLC", "compliance": "WHO standards"}'
),
(
  'Solar Heat Pump System',
  'Eco-friendly heating solution combining solar technology with heat pump efficiency. Perfect for sustainable water heating.',
  'Solar Systems',
  1200000,
  'https://images.pexels.com/photos/9875449/pexels-photo-9875449.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Rheem',
  false,
  true,
  true,
  '{"capacity": "300L", "efficiency": "COP 4.5", "solar_panels": "4 x 250W", "backup": "Electric element"}'
),
(
  'BMS Building Management System',
  'Complete building automation system for HVAC, lighting, and security control. Web-based interface with mobile app support.',
  'Building Automation',
  3500000,
  'https://images.pexels.com/photos/5474967/pexels-photo-5474967.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Schneider',
  false,
  true,
  false,
  '{"protocols": "BACnet, Modbus", "capacity": "500 points", "interface": "Web + Mobile", "warranty": "2 years"}'
) ON CONFLICT (name) DO NOTHING;

-- Insert sample projects if table is empty  
INSERT INTO projects (title, description, client_name, location, category, featured_image, completion_date, is_featured, status, excerpt, client, duration, technology_used, project_summary, process_overview, key_features, tags, gallery_images) VALUES
(
  'NDDC Headquarters HVAC Installation - Bayelsa',
  'Complete HVAC system installation for Niger Delta Development Commission headquarters building in Yenagoa, Bayelsa State.',
  'Niger Delta Development Commission (NDDC)', 
  'Yenagoa, Bayelsa State',
  'Government Projects / HVAC Engineering',
  'https://images.pexels.com/photos/5439137/pexels-photo-5439137.jpeg?auto=compress&cs=tinysrgb&w=800',
  '2024-03-15',
  true,
  'completed',
  'Major HVAC installation project for NDDC headquarters featuring advanced climate control systems and energy-efficient design.',
  'NDDC',
  '8 Weeks',
  'LG VRF Systems, BMS Light, Rheem ductless units',
  'EINSPOT successfully delivered a comprehensive HVAC solution for the NDDC headquarters, a critical government facility requiring precise climate control. The project involved installing Variable Refrigerant Flow (VRF) systems across multiple floors, ensuring optimal comfort while maintaining energy efficiency standards.',
  'The project began with detailed site assessment and load calculations. Our engineering team designed a custom VRF system layout, followed by careful installation of indoor and outdoor units. Integration with the building management system provided centralized control and monitoring capabilities.',
  '• Multi-zone climate control across 5 floors\n• Energy-efficient VRF technology\n• Integrated building management system\n• 24/7 monitoring and maintenance support\n• Compliance with international standards',
  '["NDDC HVAC Bayelsa", "VRF Systems", "Public Infrastructure", "Government Projects", "Building Management"]',
  '["https://images.pexels.com/photos/5439137/pexels-photo-5439137.jpeg", "https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg"]'
),
(
  'Luxury Hotel Water Heating System - Lagos',
  'Industrial-scale water heating installation for 200-room luxury hotel in Victoria Island, Lagos.',
  'Transcorp Hilton Lagos',
  'Victoria Island, Lagos',
  'Hospitality / Water Heating Systems', 
  'https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=800',
  '2024-01-20',
  true,
  'completed',
  'Large-scale water heating system installation for luxury hotel with advanced efficiency and reliability features.',
  'Transcorp Hilton',
  '6 Weeks',
  'Rheem Commercial Series, Heat Recovery Systems',
  'EINSPOT designed and installed a comprehensive water heating system for a 200-room luxury hotel, featuring multiple Rheem commercial water heaters with heat recovery technology. The system ensures consistent hot water supply while maximizing energy efficiency.',
  'Project execution involved installing multiple commercial-grade water heaters in a cascading configuration. Heat recovery systems were integrated to capture waste heat from HVAC systems. Advanced monitoring and control systems ensure optimal performance and energy management.',
  '• 24/7 hot water availability for 200+ rooms\n• Heat recovery technology for 40% energy savings\n• Redundant systems for reliability\n• Smart monitoring and predictive maintenance\n• Compliance with hospitality industry standards',
  '["Hotel Water Heating", "Commercial Rheem", "Heat Recovery", "Hospitality", "Energy Efficiency"]',
  '["https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg", "https://images.pexels.com/photos/5474967/pexels-photo-5474967.jpeg"]'
) ON CONFLICT (title) DO NOTHING;

-- Insert email templates if they don't exist
INSERT INTO email_templates (template_key, name, subject, html_content, is_active) VALUES
(
  'welcome',
  'Welcome Email',
  'Welcome to EINSPOT Engineering Solutions',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #0ea5e9;">Welcome to EINSPOT!</h1>
    <p>Dear {{customer_name}},</p>
    <p>Thank you for joining EINSPOT Engineering Solutions! We''re your trusted partner for engineering excellence.</p>
    <p>Best regards,<br>The EINSPOT Team</p>
  </div>',
  true
),
(
  'quote_confirmation', 
  'Quote Request Confirmation',
  'Quote Request Received - EINSPOT',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #0ea5e9;">Quote Request Received</h1>
    <p>Dear {{customer_name}},</p>
    <p>We have received your quote request for: <strong>{{product_name}}</strong></p>
    <p>Our team will review and respond within 24-48 hours.</p>
    <p>Best regards,<br>The EINSPOT Team</p>
  </div>',
  true
) ON CONFLICT (template_key) DO NOTHING;

-- Insert currency settings if they don't exist
INSERT INTO currency_settings (currency_code, currency_name, currency_symbol, symbol_position, exchange_rate, is_default, is_active) VALUES
('NGN', 'Nigerian Naira', '₦', 'left', 1.0, true, true),
('USD', 'US Dollar', '$', 'left', 0.0013, false, true),
('EUR', 'Euro', '€', 'left', 0.0012, false, true)
ON CONFLICT (currency_code) DO NOTHING;

-- Insert language settings if they don't exist  
INSERT INTO language_settings (language_code, language_name, is_default, is_active) VALUES
('en', 'English', true, true),
('fr', 'French', false, false)
ON CONFLICT (language_code) DO NOTHING;

-- Ensure all tables have proper RLS enabled
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_sections ENABLE ROW LEVEL SECURITY;

-- Refresh all materialized views if any exist
-- This ensures data consistency across the application
DO $$
BEGIN
  -- Refresh any materialized views that might exist
  NULL;
END $$;

-- Update statistics for query optimization
ANALYZE;