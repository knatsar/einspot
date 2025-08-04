-- Update all existing products to hide prices by default
UPDATE public.products 
SET show_price = false 
WHERE show_price = true OR show_price IS NULL;

-- Update the default value for future products
ALTER TABLE public.products 
ALTER COLUMN show_price SET DEFAULT false;