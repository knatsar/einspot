/*
  # Fix Admin Authentication System

  1. Security
    - Ensure RLS policies are properly configured
    - Fix profile creation and role assignment
    - Add default admin accounts

  2. Functions
    - Create get_user_role function
    - Create ensure_profile function for automatic profile creation
*/

-- Create or replace the get_user_role function
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE profiles.user_id = $1;
  
  -- Return customer as default if no role found
  RETURN COALESCE(user_role, 'customer');
END;
$$;

-- Create function to ensure profile exists
CREATE OR REPLACE FUNCTION ensure_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_role TEXT := 'customer';
  admin_emails TEXT[] := ARRAY['admin@einspot.com', 'superadmin@einspot.com', 'info@einspot.com'];
BEGIN
  -- Check if this is a default admin email
  IF NEW.email = ANY(admin_emails) THEN
    default_role := 'superadmin';
  END IF;

  -- Insert profile with appropriate role
  INSERT INTO profiles (
    user_id,
    email,
    role,
    full_name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    default_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profiles
DROP TRIGGER IF EXISTS ensure_profile_trigger ON auth.users;
CREATE TRIGGER ensure_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION ensure_profile();

-- Ensure admin accounts exist in profiles
DO $$
DECLARE
  admin_emails TEXT[] := ARRAY['admin@einspot.com', 'superadmin@einspot.com', 'info@einspot.com'];
  admin_email TEXT;
  user_record auth.users%ROWTYPE;
BEGIN
  FOREACH admin_email IN ARRAY admin_emails
  LOOP
    -- Check if user exists in auth.users
    SELECT * INTO user_record
    FROM auth.users
    WHERE email = admin_email;
    
    -- If user exists, ensure their profile has superadmin role
    IF FOUND THEN
      INSERT INTO profiles (
        user_id,
        email,
        role,
        full_name,
        created_at,
        updated_at
      ) VALUES (
        user_record.id,
        admin_email,
        'superadmin',
        split_part(admin_email, '@', 1),
        NOW(),
        NOW()
      ) ON CONFLICT (user_id) DO UPDATE SET
        role = 'superadmin',
        updated_at = NOW();
      
      RAISE NOTICE 'Ensured superadmin profile for: %', admin_email;
    END IF;
  END LOOP;
END;
$$;

-- Update RLS policies to be more permissive for profile creation
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR get_user_role(auth.uid()) IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'superadmin')
  WITH CHECK (
    (auth.uid() = user_id AND NEW.role = OLD.role) OR 
    get_user_role(auth.uid()) = 'superadmin'
  );

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_profile TO authenticated;