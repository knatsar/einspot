-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Superadmins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmins can update all profiles" ON public.profiles;

-- Recreate the superadmin policies
CREATE POLICY "Superadmins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Superadmins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (get_user_role(auth.uid()) = 'superadmin');