-- Update final RLS policies to use 'superadmin' instead of 'admin'

-- Update quotations policy
DROP POLICY IF EXISTS "Admins can manage all quotations" ON public.quotations;
CREATE POLICY "Superadmins can manage all quotations" 
ON public.quotations
FOR ALL
USING (get_user_role(auth.uid()) = 'superadmin');

DROP POLICY IF EXISTS "Users can view their own quotations" ON public.quotations;
CREATE POLICY "Users can view their own quotations" 
ON public.quotations
FOR SELECT
USING ((auth.uid() = customer_id) OR (get_user_role(auth.uid()) = 'superadmin'));

-- Update role audit log policy
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.role_audit_log;
CREATE POLICY "Only superadmins can view audit logs" 
ON public.role_audit_log
FOR SELECT
USING (get_user_role(auth.uid()) = 'superadmin');

-- Update SMTP settings policy
DROP POLICY IF EXISTS "Only admins can manage SMTP settings" ON public.smtp_settings;
CREATE POLICY "Only superadmins can manage SMTP settings" 
ON public.smtp_settings
FOR ALL
USING (get_user_role(auth.uid()) = 'superadmin');

-- Update system health logs policy
DROP POLICY IF EXISTS "Only admins can view health logs" ON public.system_health_logs;
CREATE POLICY "Only superadmins can view health logs" 
ON public.system_health_logs
FOR SELECT
USING (get_user_role(auth.uid()) = 'superadmin');

-- Update themes policy
DROP POLICY IF EXISTS "Only admins can manage themes" ON public.themes;
CREATE POLICY "Only superadmins can manage themes" 
ON public.themes
FOR ALL
USING (auth.uid() IN ( SELECT profiles.user_id FROM profiles WHERE (profiles.role = 'superadmin')));

-- Update WhatsApp messages policy
DROP POLICY IF EXISTS "Only admins can manage WhatsApp messages" ON public.whatsapp_messages;
CREATE POLICY "Only superadmins can manage WhatsApp messages" 
ON public.whatsapp_messages
FOR ALL
USING (get_user_role(auth.uid()) = 'superadmin');