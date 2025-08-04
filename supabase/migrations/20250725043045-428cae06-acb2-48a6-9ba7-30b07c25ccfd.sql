-- Add show_price column to products table if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS show_price BOOLEAN DEFAULT true;

-- Create content_sections table for dynamic content management
CREATE TABLE IF NOT EXISTS public.content_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
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

-- Enable RLS on content_sections
ALTER TABLE public.content_sections ENABLE ROW LEVEL SECURITY;

-- Create policies for content_sections
CREATE POLICY "Everyone can view active content sections" 
ON public.content_sections 
FOR SELECT 
USING (is_active = true OR get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage content sections" 
ON public.content_sections 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Create trigger for content_sections updated_at
CREATE TRIGGER update_content_sections_updated_at
BEFORE UPDATE ON public.content_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content sections
INSERT INTO public.content_sections (section_key, title, subtitle, content, is_active) VALUES
('hero', 'Engineering Excellence in Nigeria', 'Your Trusted Partner for Industrial Solutions', 'EINSPOT delivers cutting-edge engineering solutions across Nigeria. From HVAC systems to industrial automation, we provide comprehensive services that drive efficiency and innovation in your operations.', true),
('about', 'About EINSPOT', 'Leading Engineering Solutions Provider', 'With years of experience in the engineering industry, EINSPOT has established itself as a trusted partner for businesses across Nigeria. We specialize in providing comprehensive engineering solutions that meet the highest standards of quality and efficiency.', true),
('services_intro', 'Our Services', 'Comprehensive Engineering Solutions', 'We offer a wide range of engineering services designed to meet your specific needs and requirements.', true),
('contact_info', 'Get In Touch', 'Ready to Start Your Project?', 'Contact our team of experts today to discuss your engineering needs and get a customized solution.', true)
ON CONFLICT (section_key) DO NOTHING;