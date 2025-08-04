-- Fix newsletter table and functionality
BEGIN;

-- Ensure newsletter table exists with correct structure
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active',
    source TEXT DEFAULT 'website',
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Everyone can subscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Only admins can view subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can manage subscribers" ON public.newsletter_subscribers;

-- Create proper policies
CREATE POLICY "Everyone can subscribe"
ON public.newsletter_subscribers
FOR INSERT
TO public
WITH CHECK (
    email IS NOT NULL 
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

CREATE POLICY "Subscribers can view own status"
ON public.newsletter_subscribers
FOR SELECT
TO public
USING (email = current_setting('request.jwt.claims')::json->>'email');

CREATE POLICY "Admins can manage all subscribers"
ON public.newsletter_subscribers
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'superadmin')
    )
);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_newsletter_updated_at ON public.newsletter_subscribers;
CREATE TRIGGER update_newsletter_updated_at
    BEFORE UPDATE ON public.newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant proper permissions
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT ON public.newsletter_subscribers TO authenticated;

COMMIT;
