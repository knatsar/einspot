
-- Create payment_gateways table
CREATE TABLE IF NOT EXISTS public.payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stripe', 'paystack', 'flutterwave', 'razorpay', 'paypal')),
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on payment_gateways
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_gateways
CREATE POLICY "Only admins can manage payment gateways"
  ON public.payment_gateways
  FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- Add trigger to update updated_at column
CREATE TRIGGER update_payment_gateways_updated_at
  BEFORE UPDATE ON public.payment_gateways
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure only one default gateway at a time
CREATE UNIQUE INDEX unique_default_payment_gateway 
  ON public.payment_gateways (is_default) 
  WHERE is_default = true;
