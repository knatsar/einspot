-- Remove all policies from profiles table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- Create simple and clean policies for profiles table
CREATE POLICY "profiles_select_policy" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'superadmin'
);

CREATE POLICY "profiles_insert_policy" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_policy" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'superadmin'
);