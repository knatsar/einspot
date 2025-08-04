-- Create tables for menu management
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    parent_id UUID REFERENCES public.menu_items(id),
    "order" INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tables for URL management
CREATE TABLE IF NOT EXISTS public.custom_urls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_path TEXT NOT NULL,
    custom_path TEXT NOT NULL UNIQUE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entity_type, entity_id)
);

-- Create RLS policies
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_urls ENABLE ROW LEVEL SECURITY;

-- Menu items policies
CREATE POLICY "Menu items are viewable by everyone" 
    ON public.menu_items FOR SELECT 
    USING (true);

CREATE POLICY "Only admins can insert menu items" 
    ON public.menu_items FOR INSERT 
    TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'superadmin')
    ));

CREATE POLICY "Only admins can update menu items" 
    ON public.menu_items FOR UPDATE 
    TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'superadmin')
    ));

CREATE POLICY "Only admins can delete menu items" 
    ON public.menu_items FOR DELETE 
    TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'superadmin')
    ));

-- Custom URLs policies
CREATE POLICY "Custom URLs are viewable by everyone" 
    ON public.custom_urls FOR SELECT 
    USING (true);

CREATE POLICY "Only admins can manage custom URLs" 
    ON public.custom_urls FOR ALL 
    TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'superadmin')
    ));

-- Create functions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.custom_urls
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
