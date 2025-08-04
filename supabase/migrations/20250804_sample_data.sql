-- Insert sample products
INSERT INTO public.products (name, description, category, price, image_url, brand, model_number, is_active, show_price, is_featured)
VALUES
    ('Premium Split AC', 'High-efficiency split air conditioning system with smart temperature control', 'HVAC Systems', 899.99, '/public/lovable-uploads/ac-unit-1.jpg', 'Rheem', 'RA14', true, true, true),
    ('Smart Water Heater', 'Energy-efficient tankless water heater with WiFi connectivity', 'Water Heaters', 649.99, '/public/lovable-uploads/water-heater-1.jpg', 'Rheem', 'RTEX-24', true, true, true),
    ('Industrial HVAC Unit', 'Commercial-grade HVAC system for large facilities', 'HVAC Systems', 2499.99, '/public/lovable-uploads/hvac-commercial-1.jpg', 'Rheem', 'RKNL-B', true, true, false),
    ('Solar Panel System', '5kW complete solar panel system with inverter', 'Solar Systems', 3999.99, '/public/lovable-uploads/solar-1.jpg', 'Rheem', 'RSP-5000', true, true, true);

-- Insert sample projects
INSERT INTO public.projects (title, description, client_name, location, category, featured_image, completion_date, is_featured, tags, excerpt)
VALUES
    ('Lagos Tech Hub HVAC', 'Complete HVAC system installation for a modern tech hub', 'Lagos Tech Limited', 'Lagos, Nigeria', 'Commercial HVAC', '/public/lovable-uploads/project-1.jpg', '2024-12-01', true, ARRAY['HVAC', 'Commercial', 'Tech Hub'], 'State-of-the-art HVAC installation for Lagos''s newest tech hub'),
    ('Abuja Solar Farm', 'Large-scale solar installation for sustainable energy generation', 'Green Energy Nigeria', 'Abuja, Nigeria', 'Solar Installation', '/public/lovable-uploads/project-2.jpg', '2024-11-15', true, ARRAY['Solar', 'Renewable Energy', 'Commercial'], 'Powering the future with renewable energy solutions'),
    ('Victoria Island Office Complex', 'Multi-floor office complex HVAC and water system installation', 'VI Developers Ltd', 'Victoria Island, Lagos', 'Commercial MEP', '/public/lovable-uploads/project-3.jpg', '2024-10-01', true, ARRAY['MEP', 'Commercial', 'HVAC'], 'Comprehensive MEP solutions for modern office spaces');

-- Insert sample newsletter subscribers
INSERT INTO public.newsletter_subscribers (email, status, source)
VALUES
    ('sample.customer@example.com', 'active', 'website'),
    ('business.client@example.com', 'active', 'website');

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_products_timestamp
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamps();

CREATE TRIGGER update_projects_timestamp
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamps();

CREATE TRIGGER update_newsletter_subscribers_timestamp
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamps();
