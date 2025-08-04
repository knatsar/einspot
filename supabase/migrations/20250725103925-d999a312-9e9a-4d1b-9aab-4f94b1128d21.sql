-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create currency settings table
CREATE TABLE public.currency_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  currency_code TEXT NOT NULL UNIQUE,
  currency_name TEXT NOT NULL,
  currency_symbol TEXT NOT NULL,
  symbol_position TEXT DEFAULT 'left' CHECK (symbol_position IN ('left', 'right')),
  exchange_rate DECIMAL(10,4) DEFAULT 1.0,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create language settings table
CREATE TABLE public.language_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language_code TEXT NOT NULL UNIQUE,
  language_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  auto_translate BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SMTP settings table
CREATE TABLE public.smtp_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  encryption TEXT DEFAULT 'tls' CHECK (encryption IN ('tls', 'ssl', 'none')),
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smtp_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "Only admins can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for currency_settings
CREATE POLICY "Everyone can view active currency settings" 
ON public.currency_settings 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only admins can manage currency settings" 
ON public.currency_settings 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for language_settings
CREATE POLICY "Everyone can view active language settings" 
ON public.language_settings 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only admins can manage language settings" 
ON public.language_settings 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for smtp_settings
CREATE POLICY "Only admins can manage SMTP settings" 
ON public.smtp_settings 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- Insert default email templates
INSERT INTO public.email_templates (template_key, name, subject, html_content, variables) VALUES
('welcome', 'Welcome Email', 'Welcome to {{company_name}}', 
'<h1>Welcome {{customer_name}}!</h1><p>Thank you for joining {{company_name}}. We are excited to have you!</p>',
'["customer_name", "company_name"]'),
('quote_confirmation', 'Quote Confirmation', 'Quote Request Received - {{company_name}}',
'<h1>Quote Request Received</h1><p>Dear {{customer_name}}, we have received your quote request for {{product_name}}.</p>',
'["customer_name", "company_name", "product_name", "quantity"]'),
('quote_ready', 'Quote Ready', 'Your Quote is Ready - {{company_name}}',
'<h1>Your Quote is Ready!</h1><p>Dear {{customer_name}}, your quote for {{product_name}} is ready for review.</p>',
'["customer_name", "company_name", "product_name", "quantity", "quoted_price"]'),
('order_confirmation', 'Order Confirmation', 'Order Confirmation - {{order_number}}',
'<h1>Order Confirmation</h1><p>Dear {{customer_name}}, thank you for your order #{{order_number}}.</p>',
'["customer_name", "order_number", "total_amount", "status"]');

-- Insert default currency settings
INSERT INTO public.currency_settings (currency_code, currency_name, currency_symbol, symbol_position, exchange_rate, is_default) VALUES
('NGN', 'Nigerian Naira', '₦', 'left', 1.0, true),
('USD', 'US Dollar', '$', 'left', 0.0013, false),
('EUR', 'Euro', '€', 'left', 0.0012, false),
('GBP', 'British Pound', '£', 'left', 0.0010, false);

-- Insert default language settings
INSERT INTO public.language_settings (language_code, language_name, is_default) VALUES
('en', 'English', true),
('fr', 'French', false),
('es', 'Spanish', false),
('ar', 'Arabic', false),
('pt', 'Portuguese', false);

-- Create triggers for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_currency_settings_updated_at
  BEFORE UPDATE ON public.currency_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_language_settings_updated_at
  BEFORE UPDATE ON public.language_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_smtp_settings_updated_at
  BEFORE UPDATE ON public.smtp_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();