-- Combined migrations for profile enhancements and user activity

-- 1. Create user_activity_logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT,
    performed_by TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add indexes for user_activity_logs
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON user_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- Enable RLS for user_activity_logs
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- 2. Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{"newsletter": false, "marketing_emails": false, "sms_notifications": false, "language": "en", "theme": "system"}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completion_percentage integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_profile_update timestamptz DEFAULT now();

-- 3. Create profile completion calculation function
CREATE OR REPLACE FUNCTION calculate_profile_completion()
RETURNS trigger AS $$
DECLARE
    completion INTEGER := 0;
    total_fields INTEGER := 8;
    completed_fields INTEGER := 0;
BEGIN
    -- Check basic fields
    IF NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN completed_fields := completed_fields + 1; END IF;
    IF NEW.email IS NOT NULL AND NEW.email != '' THEN completed_fields := completed_fields + 1; END IF;
    IF NEW.bio IS NOT NULL AND NEW.bio != '' THEN completed_fields := completed_fields + 1; END IF;
    IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN completed_fields := completed_fields + 1; END IF;
    IF NEW.website IS NOT NULL AND NEW.website != '' THEN completed_fields := completed_fields + 1; END IF;
    IF NEW.company IS NOT NULL AND NEW.company != '' THEN completed_fields := completed_fields + 1; END IF;

    -- Check address
    IF NEW.address IS NOT NULL AND NEW.address ? 'street' 
       AND NEW.address ? 'city' 
       AND NEW.address ? 'state' 
       AND NEW.address ? 'postal_code' 
       AND NEW.address ? 'country' THEN
        completed_fields := completed_fields + 1;
    END IF;

    -- Check preferences
    IF NEW.preferences IS NOT NULL THEN completed_fields := completed_fields + 1; END IF;

    -- Calculate percentage
    NEW.profile_completion_percentage := (completed_fields::float / total_fields::float * 100)::integer;
    NEW.last_profile_update := now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile completion calculation
DROP TRIGGER IF EXISTS update_profile_completion ON profiles;
CREATE TRIGGER update_profile_completion
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION calculate_profile_completion();

-- 4. Create user suspension toggle function
CREATE OR REPLACE FUNCTION toggle_user_suspension(target_user_id UUID, suspend BOOLEAN)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    caller_role TEXT;
    target_role TEXT;
BEGIN
    -- Get the role of the calling user
    SELECT role INTO caller_role
    FROM profiles
    WHERE user_id = auth.uid();

    -- Get the role of the target user
    SELECT role INTO target_role
    FROM profiles
    WHERE user_id = target_user_id;

    -- Check if caller has permission
    IF caller_role != 'superadmin' THEN
        RAISE EXCEPTION 'Only superadmins can suspend/unsuspend users';
    END IF;

    -- Prevent suspending other superadmins
    IF target_role = 'superadmin' AND target_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Cannot suspend other superadmin users';
    END IF;

    -- Update user's suspended status
    UPDATE profiles
    SET is_suspended = suspend
    WHERE user_id = target_user_id;

    -- Update auth.users metadata
    UPDATE auth.users
    SET raw_app_meta_data = 
        CASE
            WHEN suspend THEN 
                jsonb_set(COALESCE(raw_app_meta_data, '{}'::jsonb), '{suspended}', 'true'::jsonb)
            ELSE 
                jsonb_set(COALESCE(raw_app_meta_data, '{}'::jsonb), '{suspended}', 'false'::jsonb)
        END
    WHERE id = target_user_id;
END;
$$;

-- 5. Update RLS policies
-- For profiles table
CREATE POLICY IF NOT EXISTS "Users can view their own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (
        (
            auth.uid() = user_id AND
            NEW.role = OLD.role AND
            NEW.is_suspended = OLD.is_suspended
        ) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND role = 'superadmin'
        )
    );

CREATE POLICY IF NOT EXISTS "Admins can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND (role = 'admin' OR role = 'superadmin')
        )
    );

-- For user_activity_logs table
CREATE POLICY IF NOT EXISTS "Admins can view all logs"
    ON user_activity_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
        )
    );

CREATE POLICY IF NOT EXISTS "Admins can insert logs"
    ON user_activity_logs FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
        )
    );

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION toggle_user_suspension TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_profile_completion TO authenticated;

-- Add comments
COMMENT ON TABLE user_activity_logs IS 'Stores user activity logs for auditing purposes';
COMMENT ON COLUMN profiles.is_suspended IS 'Indicates whether the user account is suspended';
COMMENT ON COLUMN profiles.address IS 'JSON object containing address details';
COMMENT ON COLUMN profiles.preferences IS 'JSON object containing user preferences';
COMMENT ON COLUMN profiles.profile_completion_percentage IS 'Calculated percentage of profile completion';
COMMENT ON COLUMN profiles.last_profile_update IS 'Timestamp of last profile update';
