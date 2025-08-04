-- Test our role functions and ensure default admin exists
-- Test the get_user_role function
SELECT get_user_role('23ea01d4-1f05-4390-991a-b9d0ae45e62e'::uuid) as test_role;

-- Create a function to ensure default admin exists
CREATE OR REPLACE FUNCTION public.ensure_default_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  admin_exists BOOLEAN;
BEGIN
  -- Check if any superadmin exists
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE role = 'superadmin'
  ) INTO admin_exists;
  
  -- If no superadmin exists, we need to handle this differently
  -- since we can't create auth users from SQL
  IF NOT admin_exists THEN
    RAISE NOTICE 'No superadmin found. Please create one via signup with admin@einspot.com';
  END IF;
END;
$$;

-- Call the function to check
SELECT ensure_default_admin();

-- Show current admin users
SELECT p.user_id, p.full_name, p.role, p.created_at 
FROM public.profiles p 
WHERE p.role IN ('admin', 'superadmin') 
ORDER BY p.created_at;