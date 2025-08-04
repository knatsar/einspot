-- Update all RLS policies to use 'superadmin' instead of 'admin'

-- Update admin invitations policy
DROP POLICY IF EXISTS "Only admins can manage admin invitations" ON public.admin_invitations;
CREATE POLICY "Only superadmins can manage admin invitations" 
ON public.admin_invitations
FOR ALL
USING (get_user_role(auth.uid()) = 'superadmin');

-- Update analytics events policy
DROP POLICY IF EXISTS "Only admins can view analytics events" ON public.analytics_events;
CREATE POLICY "Only superadmins can view analytics events" 
ON public.analytics_events
FOR SELECT
USING (get_user_role(auth.uid()) = 'superadmin');

-- Update backup logs policy
DROP POLICY IF EXISTS "Only admins can view backup logs" ON public.backup_logs;
CREATE POLICY "Only superadmins can view backup logs" 
ON public.backup_logs
FOR SELECT
USING (get_user_role(auth.uid()) = 'superadmin');

-- Update blog posts policy
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Superadmins can manage blog posts" 
ON public.blog_posts
FOR ALL
USING (get_user_role(auth.uid()) = 'superadmin');

DROP POLICY IF EXISTS "Everyone can view published posts" ON public.blog_posts;
CREATE POLICY "Everyone can view published posts" 
ON public.blog_posts
FOR SELECT
USING ((is_published = true) OR (get_user_role(auth.uid()) = 'superadmin'));

-- Update chat config policy
DROP POLICY IF EXISTS "Only admins can manage chat config" ON public.chat_config;
CREATE POLICY "Only superadmins can manage chat config" 
ON public.chat_config
FOR ALL
USING (auth.uid() IN ( SELECT profiles.user_id FROM profiles WHERE (profiles.role = 'superadmin')));

-- Update content sections policy
DROP POLICY IF EXISTS "Admins can manage content sections" ON public.content_sections;
CREATE POLICY "Superadmins can manage content sections" 
ON public.content_sections
FOR ALL
USING (get_user_role(auth.uid()) = 'superadmin');

DROP POLICY IF EXISTS "Everyone can view active content sections" ON public.content_sections;
CREATE POLICY "Everyone can view active content sections" 
ON public.content_sections
FOR SELECT
USING ((is_active = true) OR (get_user_role(auth.uid()) = 'superadmin'));

-- Update currency settings policy
DROP POLICY IF EXISTS "Only admins can manage currency settings" ON public.currency_settings;
CREATE POLICY "Only superadmins can manage currency settings" 
ON public.currency_settings
FOR ALL
USING (get_user_role(auth.uid()) = 'superadmin');

-- Update email templates policy
DROP POLICY IF EXISTS "Only admins can manage email templates" ON public.email_templates;
CREATE POLICY "Only superadmins can manage email templates" 
ON public.email_templates
FOR ALL
USING (get_user_role(auth.uid()) = 'superadmin');

-- Update language settings policy
DROP POLICY IF EXISTS "Only admins can manage language settings" ON public.language_settings;
CREATE POLICY "Only superadmins can manage language settings" 
ON public.language_settings
FOR ALL
USING (get_user_role(auth.uid()) = 'superadmin');