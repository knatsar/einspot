CREATE TABLE IF NOT EXISTS "admin_settings" (
  "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "session_timeout_minutes" integer NOT NULL DEFAULT 30,
  "require_email_verification" boolean NOT NULL DEFAULT true,
  "max_login_attempts" integer NOT NULL DEFAULT 5,
  "password_expiry_days" integer NOT NULL DEFAULT 90,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_sessions" (
  "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "user_id" uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "last_active" timestamptz NOT NULL DEFAULT now(),
  "expires_at" timestamptz NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE "admin_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_sessions" ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_settings
CREATE POLICY "admin_settings_read" ON "admin_settings"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.role = 'admin'::text
        OR auth.users.role = 'superadmin'::text
      )
    )
  );

CREATE POLICY "admin_settings_write" ON "admin_settings"
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.role = 'superadmin'::text
      )
    )
  );

-- Create policies for user_sessions
CREATE POLICY "user_sessions_read" ON "user_sessions"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.role = 'admin'::text
        OR auth.users.role = 'superadmin'::text
      )
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "user_sessions_write" ON "user_sessions"
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.role = 'admin'::text
        OR auth.users.role = 'superadmin'::text
      )
    )
    OR user_id = auth.uid()
  );
