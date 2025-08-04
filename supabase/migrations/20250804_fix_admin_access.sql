-- Fix admin dashboard access and performance
BEGIN;

-- Ensure all required tables exist first
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price DECIMAL(10,2),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    content TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for faster role checks
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Ensure proper admin role values
UPDATE public.profiles
SET role = 'superadmin'
WHERE email IN (
    'admin@einspot.com',
    'superadmin@einspot.com',
    'info@einspot.com'
) AND role != 'superadmin';

-- Fix RLS policies for admin access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'superadmin')
    )
);

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'superadmin')
    )
);

-- Add stats view for admin dashboard
DO $$ 
BEGIN
    DROP VIEW IF EXISTS admin_dashboard_stats;
    
    CREATE VIEW admin_dashboard_stats AS
    SELECT
        COALESCE((SELECT COUNT(*) FROM public.products WHERE is_active = true), 0) as active_products,
        COALESCE((SELECT COUNT(*) FROM public.projects), 0) as total_projects,
        COALESCE((SELECT COUNT(*) FROM public.blog_posts WHERE is_published = true), 0) as published_posts,
        COALESCE((SELECT COUNT(*) FROM public.newsletter_subscribers WHERE status = 'active'), 0) as active_subscribers;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating admin_dashboard_stats view: %', SQLERRM;
END $$;

GRANT SELECT ON admin_dashboard_stats TO authenticated;

COMMIT;
