-- Add profile fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    parent_id UUID REFERENCES menu_items(id),
    "order" INTEGER NOT NULL,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create custom_urls table for URL management
CREATE TABLE IF NOT EXISTS custom_urls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    original_path TEXT NOT NULL,
    custom_path TEXT NOT NULL UNIQUE,
    entity_type TEXT NOT NULL, -- 'product', 'post', 'project'
    entity_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create index for faster URL lookups
CREATE INDEX IF NOT EXISTS idx_custom_urls_custom_path ON custom_urls(custom_path);

-- Add RLS policies
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to menu_items"
ON menu_items FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Allow admin update on menu_items"
ON menu_items FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
    )
);

ALTER TABLE custom_urls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to custom_urls"
ON custom_urls FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Allow admin update on custom_urls"
ON custom_urls FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
    )
);
