-- Create profile for existing admin user (admin@einspot.com)
-- First, get the user ID for admin@einspot.com from auth.users
-- Insert profile for existing admin user if it doesn't exist
INSERT INTO public.profiles (user_id, full_name, role)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'full_name', 'EINSPOT Admin'),
    'admin'
FROM auth.users 
WHERE email = 'admin@einspot.com'
AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.users.id
);

-- Update the handle_new_user function to properly handle admin assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email IN ('admin@einspot.com', 'superadmin@einspot.com') THEN 'admin'
      ELSE 'customer'
    END
  );
  RETURN NEW;
END;
$function$;