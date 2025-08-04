-- Fix the authentication and role system completely
-- Step 1: Ensure we have the proper get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(role, 'customer') FROM public.profiles WHERE profiles.user_id = $1 LIMIT 1;
$$;

-- Step 2: Update the is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  );
$$;

-- Step 3: Update the handle_new_user function to set proper roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.email IN ('admin@einspot.com', 'superadmin@einspot.com') THEN 'superadmin'
      ELSE 'customer'
    END
  );
  RETURN NEW;
END;
$$;

-- Step 4: Ensure existing admin accounts have correct roles
UPDATE public.profiles 
SET role = 'superadmin' 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('admin@einspot.com', 'superadmin@einspot.com')
);

-- Step 5: Set all other users to customer if no role is set
UPDATE public.profiles 
SET role = 'customer' 
WHERE role IS NULL OR role = '';

-- Step 6: Add constraint to ensure role column is not null
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'customer',
ALTER COLUMN role SET NOT NULL;