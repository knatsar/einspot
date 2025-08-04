import { User } from '@supabase/supabase-js';

export interface DatabaseUser extends User {
  role: UserRole;
  full_name: string;
}

export interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: UserRole;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
  };
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: {
    name: string;
  };
}

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id: string;
  total_amount: number;
  status: QuotationStatus;
  valid_until: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
  };
  products?: {
    name: string;
  };
  items: QuotationItem[];
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  description?: string;
  product?: {
    name: string;
  };
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type UserRole = 'user' | 'admin' | 'superadmin';

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
  parent_id?: string | null;
  order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  children?: MenuItem[];
}

export interface CustomUrl {
  id: string;
  original_path: string;
  custom_path: string;
  entity_type: 'product' | 'service' | 'blog' | 'page';
  entity_id: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
