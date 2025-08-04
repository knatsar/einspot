-- Restore complete data from all migrations
BEGIN;

-- First restore core data from 20250725050210-62fde5cc
INSERT INTO public.projects (
  title, description, client_name, location, category, excerpt, client, 
  status, duration, technology_used, project_summary, process_overview, 
  key_features, client_feedback, client_feedback_author, tags, completion_date, 
  is_featured, featured_image
) 
SELECT * FROM (
  VALUES
    -- NDDC Project
    ('HVAC Installation for NDDC Regional Office – Bayelsa',
     'High-efficiency HVAC installation for government facility featuring LG VRF systems and zone control technology.',
     'Niger Delta Development Commission (NDDC)',
     'Yenagoa, Bayelsa State, Nigeria',
     'Government Projects / HVAC Engineering',
     'EINSPOT SOLUTIONS NIG LTD delivered a high-efficiency HVAC installation for the NDDC regional office in Bayelsa...',
     'Niger Delta Development Commission (NDDC)',
     'Completed',
     '5 Weeks',
     'LG VRF Systems, BMS Light, Rheem ductless units',
     'The NDDC Bayelsa office needed a modern HVAC system...',
     '• Initial Audit: Site walk-through, HVAC needs assessment...',
     '• LG multi-zone VRF solution optimized for Nigerian climate...',
     'We are impressed with EINSPOT''s professionalism...',
     'Engr. Dimeji Okafor, NDDC Bayelsa Facility Manager',
     ARRAY['NDDC HVAC Bayelsa', 'VRF Systems', 'Public Infrastructure'],
     '2024-12-15',
     true,
     '/src/assets/hvac-unit.jpg'),

    -- Church Project
    ('Church of Jesus Christ HVAC Upgrade – Abia State',
     'Full HVAC redesign for worship facility featuring noise-sensitive components and temperature zoning.',
     'Church of Jesus Christ of Latter-Day Saints',
     'Aba, Abia State',
     'Worship & Institutional Projects / HVAC Solutions',
     'EINSPOT delivered a full HVAC redesign for the LDS worship facility...',
     'Church of Jesus Christ of Latter-Day Saints',
     'Completed',
     '4 Weeks',
     'LG VRF, Rheem Wall Units, BMS Lite',
     'EINSPOT delivered a full HVAC redesign...',
     '• Site assessment and worship space acoustics evaluation...',
     '• Ceiling-mounted cassette units for silent cooling...',
     'EINSPOT transformed our worship environment...',
     'Bishop Michael Adaora, LDS Aba Ward',
     ARRAY['Worship HVAC Design', 'VRF for Churches', 'Energy Efficient Cooling'],
     '2024-11-20',
     false,
     '/src/assets/industrial-facility.jpg')
) AS v;

-- Restore products from original data
INSERT INTO public.products (
  name, description, category, price, image_url, 
  specifications, brand, model_number, is_active, 
  show_price, is_featured
)
SELECT * FROM (
  VALUES 
    ('Rheem Professional Series Water Heater 50L',
     'High-efficiency electric water heater perfect for residential and commercial use.',
     'Water Heaters',
     450000,
     'https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg',
     '{"capacity": "50L", "power": "3000W", "voltage": "220V"}',
     'Rheem',
     'PRO-50L',
     true,
     true,
     true),
     
    ('Industrial Heat Pump',
     'High-efficiency industrial heat pump for large-scale heating and cooling applications',
     'HVAC Systems',
     45000.00,
     '/src/assets/heat-pump.jpg',
     '{"capacity": "500kW", "efficiency": "COP 4.5", "voltage": "380V"}',
     'Rheem',
     'IHP-500',
     true,
     true,
     true)
) AS v;

-- Restore blog posts
INSERT INTO public.blog_posts (
  title, slug, content, excerpt, featured_image, 
  category, tags, is_published
)
SELECT * FROM (
  VALUES
    ('Energy Efficiency in Industrial HVAC Systems',
     'energy-efficiency-industrial-hvac',
     'Industrial HVAC systems are critical for maintaining optimal working conditions...',
     'Learn how to optimize your industrial HVAC systems for maximum energy efficiency and cost savings.',
     '/src/assets/consultation.jpg',
     'HVAC',
     ARRAY['hvac', 'energy efficiency', 'industrial'],
     true),
     
    ('Solar Energy Solutions for Nigerian Businesses',
     'solar-energy-solutions-nigeria',
     'Nigeria''s abundant sunshine makes it ideal for solar energy solutions...',
     'Discover the benefits of solar energy adoption for businesses across Nigeria.',
     '/src/assets/solar-panels.jpg',
     'Solar Energy',
     ARRAY['solar', 'renewable energy', 'nigeria'],
     true)
) AS v;

COMMIT;