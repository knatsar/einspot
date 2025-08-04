-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS address jsonb,
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{"newsletter": false, "marketing_emails": false, "sms_notifications": false, "language": "en", "theme": "system"}'::jsonb,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS profile_completion_percentage integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_profile_update timestamptz DEFAULT now();

-- Create a function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion()
RETURNS trigger AS $$
DECLARE
    completion INTEGER := 0;
    total_fields INTEGER := 8; -- Base fields (full_name, email, bio, phone, website, company, address, preferences)
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

-- Create trigger to update completion percentage
DROP TRIGGER IF EXISTS update_profile_completion ON profiles;
CREATE TRIGGER update_profile_completion
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION calculate_profile_completion();

-- Create index for profile completion percentage
CREATE INDEX IF NOT EXISTS idx_profiles_completion ON profiles(profile_completion_percentage);

-- Add comments
COMMENT ON COLUMN profiles.address IS 'JSON object containing address details';
COMMENT ON COLUMN profiles.preferences IS 'JSON object containing user preferences';
COMMENT ON COLUMN profiles.profile_completion_percentage IS 'Calculated percentage of profile completion';
COMMENT ON COLUMN profiles.last_profile_update IS 'Timestamp of last profile update';
