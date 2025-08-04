-- Update remaining RLS policies to use 'superadmin' instead of 'admin'

-- Update order items policy
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Superadmins can manage order items" 
ON public.order_items
FOR ALL
USING (get_user_role(auth.uid()) = 'superadmin');

DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;
CREATE POLICY "Users can view their order items" 
ON public.order_items
FOR SELECT
USING (EXISTS ( SELECT 1 FROM orders WHERE ((orders.id = order_items.order_id) AND ((orders.customer_id = auth.uid()) OR (get_user_role(auth.uid()) = 'superadmin')))));

-- Update orders policy
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Superadmins can manage all orders" 
ON public.orders
FOR ALL
USING (get_user_role(auth.uid()) = 'superadmin');

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" 
ON public.orders
FOR SELECT
USING ((auth.uid() = customer_id) OR (get_user_role(auth.uid()) = 'superadmin'));

-- Update payment gateways policy
DROP POLICY IF EXISTS "Only admins can manage payment gateways" ON public.payment_gateways;
CREATE POLICY "Only superadmins can manage payment gateways" 
ON public.payment_gateways
FOR ALL
USING (get_user_role(auth.uid()) = 'superadmin');

-- Update product categories policy
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.product_categories;
CREATE POLICY "Only superadmins can manage categories" 
ON public.product_categories
FOR ALL
USING (auth.uid() IN ( SELECT profiles.user_id FROM profiles WHERE (profiles.role = 'superadmin')));

-- Update products policy
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Superadmins can manage products" 
ON public.products
FOR ALL
USING (get_user_role(auth.uid()) = 'superadmin');

DROP POLICY IF EXISTS "Everyone can view active products" ON public.products;
CREATE POLICY "Everyone can view active products" 
ON public.products
FOR SELECT
USING ((is_active = true) OR (get_user_role(auth.uid()) = 'superadmin'));

-- Update profiles policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Superadmins can view all profiles" 
ON public.profiles
FOR ALL
USING (get_user_role(auth.uid()) = 'superadmin');

-- Update projects policy
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
CREATE POLICY "Superadmins can manage projects" 
ON public.projects
FOR ALL
USING (get_user_role(auth.uid()) = 'superadmin');