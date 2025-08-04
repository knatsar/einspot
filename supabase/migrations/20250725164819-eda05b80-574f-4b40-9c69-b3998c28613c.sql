-- Drop existing problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;

-- Create safe policies using the existing get_user_role function
-- This function is already defined as SECURITY DEFINER which prevents recursion
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    get_user_role(auth.uid()) = 'superadmin'
  );

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE 
  USING (
    auth.uid() = user_id OR 
    get_user_role(auth.uid()) = 'superadmin'
  );

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);