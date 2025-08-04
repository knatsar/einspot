-- Create proper RLS policies for the profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow superadmins to view all profiles
CREATE POLICY "Superadmins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'superadmin');

-- Allow superadmins to update all profiles
CREATE POLICY "Superadmins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (get_user_role(auth.uid()) = 'superadmin');