-- Create function to toggle user suspension
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

    -- Update the user's suspended status in auth.users
    UPDATE auth.users
    SET raw_app_meta_data = 
        CASE
            WHEN suspend THEN 
                jsonb_set(COALESCE(raw_app_meta_data, '{}'::jsonb), '{suspended}', 'true'::jsonb)
            ELSE 
                jsonb_set(COALESCE(raw_app_meta_data, '{}'::jsonb), '{suspended}', 'false'::jsonb)
        END
    WHERE id = target_user_id;

    -- Update the is_suspended field in profiles
    UPDATE profiles
    SET is_suspended = suspend
    WHERE user_id = target_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION toggle_user_suspension TO authenticated;

-- Add comment to function
COMMENT ON FUNCTION toggle_user_suspension IS 'Toggles the suspension status of a user. Only superadmins can suspend/unsuspend users.';
