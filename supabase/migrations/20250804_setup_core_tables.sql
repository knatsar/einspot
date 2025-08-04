-- Create base tables for core functionality
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price DECIMAL(10,2),
    image_url TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    show_price BOOLEAN DEFAULT true,
    brand TEXT DEFAULT 'Rheem',
    model_number TEXT,
    features TEXT,
    installation_manual_url TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    quote_available BOOLEAN DEFAULT true,
    stock_status TEXT DEFAULT 'In Stock',
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    client_name TEXT,
    location TEXT,
    category TEXT,
    featured_image TEXT,
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
    gallery_images TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    source VARCHAR(50) DEFAULT 'website',
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    email TEXT,
    company TEXT,
    role TEXT DEFAULT 'customer',
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Products
CREATE POLICY "Everyone can view active products" ON public.products
    FOR SELECT USING (is_active = true OR get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Superadmins can manage products" ON public.products
    FOR ALL USING (get_user_role(auth.uid()) = 'superadmin');

-- Projects
CREATE POLICY "Everyone can view projects" ON public.projects
    FOR SELECT USING (true);

CREATE POLICY "Superadmins can manage projects" ON public.projects
    FOR ALL USING (get_user_role(auth.uid()) = 'superadmin');

-- Newsletter Subscribers
CREATE POLICY "Everyone can subscribe" ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Superadmins can manage subscribers" ON public.newsletter_subscribers
    FOR ALL USING (get_user_role(auth.uid()) = 'superadmin');

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Superadmins can manage profiles" ON public.profiles
    FOR ALL USING (get_user_role(auth.uid()) = 'superadmin');

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(uid uuid)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = uid;
$$ LANGUAGE sql SECURITY DEFINER;
