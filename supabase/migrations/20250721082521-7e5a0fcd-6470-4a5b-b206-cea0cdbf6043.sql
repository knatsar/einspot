-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  location TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2),
  image_url TEXT,
  gallery_images TEXT[],
  specifications JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotations table
CREATE TABLE public.quotations (
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

-- Create orders table
CREATE TABLE public.orders (
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

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE public.blog_posts (
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

-- Create projects table for portfolio
CREATE TABLE public.projects (
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE profiles.user_id = $1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for products
CREATE POLICY "Everyone can view active products" ON public.products
  FOR SELECT USING (is_active = true OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for quotations
CREATE POLICY "Users can view their own quotations" ON public.quotations
  FOR SELECT USING (auth.uid() = customer_id OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can create quotations" ON public.quotations
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their pending quotations" ON public.quotations
  FOR UPDATE USING (auth.uid() = customer_id AND status = 'pending');

CREATE POLICY "Admins can manage all quotations" ON public.quotations
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = customer_id OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for order_items
CREATE POLICY "Users can view their order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.customer_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin')
    )
  );

CREATE POLICY "Admins can manage order items" ON public.order_items
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for blog_posts
CREATE POLICY "Everyone can view published posts" ON public.blog_posts
  FOR SELECT USING (is_published = true OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for projects
CREATE POLICY "Everyone can view projects" ON public.projects
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage projects" ON public.projects
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email = 'admin@einspot.com' THEN 'admin'
      ELSE 'customer'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Insert sample products
INSERT INTO public.products (name, description, category, price, image_url, specifications, is_active) VALUES
('Industrial Heat Pump', 'High-efficiency industrial heat pump for large-scale heating and cooling applications', 'HVAC Systems', 45000.00, '/src/assets/heat-pump.jpg', '{"capacity": "500kW", "efficiency": "COP 4.5", "voltage": "380V"}', true),
('Water Treatment System', 'Advanced water purification and treatment system for industrial use', 'Water Systems', 75000.00, '/src/assets/water-treatment.jpg', '{"capacity": "10000L/hr", "filtration": "Multi-stage", "automation": "PLC controlled"}', true),
('Solar Panel Array', 'Commercial-grade solar panel installation with monitoring system', 'Solar Energy', 120000.00, '/src/assets/solar-panels.jpg', '{"power": "100kW", "panels": "400W each", "warranty": "25 years"}', true),
('Backup Generator', 'Diesel backup generator for continuous power supply', 'Power Systems', 85000.00, '/src/assets/generator.jpg', '{"power": "250kVA", "fuel": "Diesel", "runtime": "24hrs"}', true),
('HVAC Unit', 'Central air conditioning system for commercial buildings', 'HVAC Systems', 35000.00, '/src/assets/hvac-unit.jpg', '{"cooling": "50 tons", "heating": "Gas fired", "controls": "Smart thermostat"}', true);

-- Insert sample projects
INSERT INTO public.projects (title, description, client_name, location, category, featured_image, completion_date, is_featured) VALUES
('Lagos Industrial Complex', 'Complete HVAC and power systems installation for manufacturing facility', 'Lagos Manufacturing Ltd', 'Lagos, Nigeria', 'Industrial', '/src/assets/industrial-facility.jpg', '2024-06-15', true),
('Abuja Office Building', 'Energy-efficient cooling and heating solution for 20-story office complex', 'Federal Ministry Building', 'Abuja, Nigeria', 'Commercial', '/src/assets/team-consultation.jpg', '2024-05-20', true),
('Port Harcourt Refinery', 'Water treatment and power backup systems for oil refinery', 'NNPC Port Harcourt', 'Port Harcourt, Nigeria', 'Oil & Gas', '/src/assets/water-treatment.jpg', '2024-04-10', false),
('Kano Solar Farm', '50MW solar installation with grid integration', 'Kano State Government', 'Kano, Nigeria', 'Solar Energy', '/src/assets/solar-panels.jpg', '2024-03-25', true);

-- Insert sample blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, featured_image, category, tags, meta_title, meta_description, is_published) VALUES
('Energy Efficiency in Industrial HVAC Systems', 'energy-efficiency-industrial-hvac', 'Learn how to optimize your industrial HVAC systems for maximum energy efficiency and cost savings.', 'Industrial HVAC systems are critical for maintaining optimal working conditions...', '/src/assets/consultation.jpg', 'HVAC', ARRAY['hvac', 'energy efficiency', 'industrial'], 'Energy Efficiency in Industrial HVAC Systems - EINSPOT', 'Comprehensive guide to optimizing industrial HVAC systems for energy efficiency and cost savings.', true),
('Solar Energy Solutions for Nigerian Businesses', 'solar-energy-solutions-nigeria', 'Discover the benefits of solar energy adoption for businesses across Nigeria.', 'Nigeria''s abundant sunshine makes it ideal for solar energy solutions...', '/src/assets/solar-panels.jpg', 'Solar Energy', ARRAY['solar', 'renewable energy', 'nigeria'], 'Solar Energy Solutions for Nigerian Businesses - EINSPOT', 'Learn about solar energy benefits and solutions for businesses in Nigeria.', true);