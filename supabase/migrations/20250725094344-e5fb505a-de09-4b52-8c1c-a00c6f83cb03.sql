-- Create tables for WhatsApp messages and monitoring
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  contact_name TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  response_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for backup logs
CREATE TABLE IF NOT EXISTS public.backup_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_type TEXT NOT NULL,
  status TEXT NOT NULL,
  metadata JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for system health monitoring
CREATE TABLE IF NOT EXISTS public.system_health_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for analytics tracking
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id UUID,
  session_id TEXT,
  properties JSONB,
  page_url TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on WhatsApp messages
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Enable RLS on backup logs
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on system health logs
ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on analytics events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for WhatsApp messages (admin only)
CREATE POLICY "Only admins can manage WhatsApp messages" 
ON public.whatsapp_messages 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Create RLS policies for backup logs (admin only)
CREATE POLICY "Only admins can view backup logs" 
ON public.backup_logs 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "System can insert backup logs" 
ON public.backup_logs 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for system health logs (admin only)
CREATE POLICY "Only admins can view health logs" 
ON public.system_health_logs 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "System can insert health logs" 
ON public.system_health_logs 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for analytics events
CREATE POLICY "Analytics events are insertable by anyone" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin');

-- Create triggers for updated_at
CREATE TRIGGER update_whatsapp_messages_updated_at
BEFORE UPDATE ON public.whatsapp_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_whatsapp_messages_phone ON public.whatsapp_messages(phone_number);
CREATE INDEX idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at);
CREATE INDEX idx_backup_logs_created_at ON public.backup_logs(created_at);
CREATE INDEX idx_backup_logs_status ON public.backup_logs(status);
CREATE INDEX idx_health_logs_created_at ON public.system_health_logs(created_at);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events(event_name);