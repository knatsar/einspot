-- Create themes table
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  hero_config JSONB NOT NULL,
  layout_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger to ensure only one active theme
CREATE OR REPLACE FUNCTION ensure_single_active_theme()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE themes SET is_active = false WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_active_theme_trigger
BEFORE INSERT OR UPDATE ON themes
FOR EACH ROW
EXECUTE FUNCTION ensure_single_active_theme();

-- Insert default themes
INSERT INTO themes (name, hero_config, layout_config, is_active)
VALUES 
(
  'Modern Light',
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
  }'::jsonb,
  '{
    "padding": "4rem",
    "alignment": "center",
    "maxWidth": "1280px"
  }'::jsonb,
  true
),
(
  'Dynamic Dark',
  '{
    "style": "dark_gradient",
    "background_type": "video",
    "title": "Sustainable Energy Solutions",
    "subtitle": "Empowering Nigerian businesses with innovative energy solutions and smart technology integration.",
    "cta_buttons": [
      {"text": "Get Started", "link": "/contact", "style": "primary"},
      {"text": "Our Services", "link": "/services", "style": "secondary"}
    ],
    "stats": [
      {"value": "98%", "label": "Customer Satisfaction"},
      {"value": "100+", "label": "Business Partners"},
      {"value": "30%", "label": "Energy Savings"},
      {"value": "1000+", "label": "Installations"}
    ]
  }'::jsonb,
  '{
    "padding": "6rem",
    "alignment": "left",
    "maxWidth": "1440px"
  }'::jsonb,
  false
);
