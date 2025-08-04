-- Fix the get_user_role function to avoid RLS issues
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE profiles.user_id = $1 LIMIT 1;
$$;

-- Drop the existing conflicting policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;

-- Create new policies that don't cause recursion
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Superadmins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'superadmin'
  )
);

-- Test the function
SELECT get_user_role('23ea01d4-1f05-4390-991a-b9d0ae45e62e'::uuid) as test_role;