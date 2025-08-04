-- First, drop the existing role check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new check constraint that includes superadmin
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'superadmin'));

-- Update existing admin users to superadmin
UPDATE public.profiles 
SET role = 'superadmin' 
WHERE role = 'admin';

-- Update the handle_new_user function to set proper roles
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

-- Update the change_user_role function to only allow superadmins to change roles
CREATE OR REPLACE FUNCTION public.change_user_role(target_user_id uuid, new_role text, reason text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_user_role TEXT;
  old_role TEXT;
BEGIN
  -- Check if current user is superadmin
  current_user_role := get_user_role(auth.uid());
  IF current_user_role != 'superadmin' THEN
    RAISE EXCEPTION 'Only superadmins can change user roles';
  END IF;
  
  -- Prevent changing to superadmin unless current user is superadmin
  IF new_role = 'superadmin' AND current_user_role != 'superadmin' THEN
    RAISE EXCEPTION 'Only superadmins can grant superadmin privileges';
  END IF;
  
  -- Get current role
  SELECT role INTO old_role FROM public.profiles WHERE user_id = target_user_id;
  
  -- Update role
  UPDATE public.profiles 
  SET role = new_role, updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Log the change
  INSERT INTO public.role_audit_log (user_id, old_role, new_role, changed_by, reason)
  VALUES (target_user_id, old_role, new_role, auth.uid(), reason);
  
  RETURN TRUE;
END;
$$;