-- Function to check if a user has admin access
CREATE OR REPLACE FUNCTION public.get_admin_access(uid uuid) 
RETURNS boolean AS $$
DECLARE
    user_email text;
BEGIN
    -- Get user's email from auth.users
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = uid;

    -- Check if user has admin or superadmin role
    -- Also check email domain as fallback
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE user_id = uid 
        AND (
            role IN ('admin', 'superadmin')
            OR (
                user_email LIKE '%@einspot.com'
                OR user_email LIKE '%@einspot.com.ng'
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ensure user profile exists
CREATE OR REPLACE FUNCTION public.ensure_user_profile() 
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN NEW.email IN ('admin@einspot.com', 'superadmin@einspot.com') THEN 'superadmin'
            WHEN NEW.email LIKE '%@einspot.com' OR NEW.email LIKE '%@einspot.com.ng' THEN 'admin'
            ELSE 'customer'
        END,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop conflicting policies
DROP POLICY IF EXISTS "Only superadmins can manage admin invitations" ON public.admin_invitations;
DROP POLICY IF EXISTS "Only superadmins can view analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Only superadmins can view backup logs" ON public.backup_logs;
DROP POLICY IF EXISTS "Only superadmins can view health logs" ON public.system_health_logs;
DROP POLICY IF EXISTS "Only superadmins can manage themes" ON public.themes;
DROP POLICY IF EXISTS "Only superadmins can manage WhatsApp messages" ON public.whatsapp_messages;

-- Create new policies that allow both admin and superadmin access
CREATE POLICY "Admins can manage admin invitations"
ON public.admin_invitations
FOR ALL
USING (get_admin_access(auth.uid()));

CREATE POLICY "Admins can view analytics events"
ON public.analytics_events
FOR SELECT
USING (get_admin_access(auth.uid()));

CREATE POLICY "Admins can view backup logs"
ON public.backup_logs
FOR SELECT
USING (get_admin_access(auth.uid()));

CREATE POLICY "Admins can view health logs"
ON public.system_health_logs
FOR SELECT
USING (get_admin_access(auth.uid()));

CREATE POLICY "Admins can manage themes"
ON public.themes
FOR ALL
USING (get_admin_access(auth.uid()));

CREATE POLICY "Admins can manage WhatsApp messages"
ON public.whatsapp_messages
FOR ALL
USING (get_admin_access(auth.uid()));

-- Ensure all necessary tables have RLS enabled
ALTER TABLE IF EXISTS public.admin_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.backup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_user_profile();

-- Ensure existing users have profiles
INSERT INTO public.profiles (user_id, email, role, created_at, updated_at)
SELECT 
    id,
    email,
    CASE 
        WHEN email IN ('admin@einspot.com', 'superadmin@einspot.com') THEN 'superadmin'
        WHEN email LIKE '%@einspot.com' OR email LIKE '%@einspot.com.ng' THEN 'admin'
        ELSE 'customer'
    END,
    NOW(),
    NOW()
FROM auth.users
ON CONFLICT (user_id) DO UPDATE
SET 
    role = CASE 
        WHEN profiles.email IN ('admin@einspot.com', 'superadmin@einspot.com') THEN 'superadmin'
        WHEN profiles.email LIKE '%@einspot.com' OR profiles.email LIKE '%@einspot.com.ng' THEN 'admin'
        ELSE profiles.role
    END,
    updated_at = NOW()
WHERE profiles.role != 'superadmin' OR profiles.email IN ('admin@einspot.com', 'superadmin@einspot.com');
