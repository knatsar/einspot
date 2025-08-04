import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { useUrlStore } from '@/stores/url-store';
import { withRetry } from '@/utils/retry';

export interface CustomUrl {
  id: string;
  original_path: string;
  custom_path: string;
  entity_type: 'product' | 'post' | 'project' | 'page' | 'service' | 'blog';
  entity_id: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Client-side validation schema
export const customUrlSchema = z.object({
  original_path: z.string().url('Must be a valid URL'),
  custom_path: z.string()
    .min(1, 'Custom path is required')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens are allowed')
    .transform(val => sanitizeUrlPath(val)),
  entity_type: z.enum(['product', 'post', 'project', 'page', 'service', 'blog']),
  entity_id: z.string().uuid('Must be a valid UUID'),
});

export type CustomUrlInput = z.infer<typeof customUrlSchema>;

export async function createCustomUrl(customUrl: CustomUrlInput) {
  // Validate input
  const validated = customUrlSchema.parse(customUrl);
  
  const { data, error } = await supabase
    .from('custom_urls')
    .insert({
      ...validated,
      is_active: true,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
  
  const store = useUrlStore.getState();
  store.addUrl(data as CustomUrl);
  return data;
}

export async function updateCustomUrl(id: string, updates: Partial<CustomUrl>) {
  const store = useUrlStore.getState();
  const currentUrl = store.urls.get(id);
  
  if (!currentUrl) {
    throw new Error('URL not found');
  }

  // Apply optimistic update
  const optimisticUrl = { ...currentUrl, ...updates, updated_at: new Date().toISOString() };
  store.addOptimisticUpdate(id, optimisticUrl);

  try {
    const { data, error } = await supabase
      .from('custom_urls')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Update succeeded, remove optimistic update and update actual data
    store.removeOptimisticUpdate(id);
    store.updateUrl(id, data as CustomUrl);
    return data;
  } catch (error) {
    // Update failed, remove optimistic update
    store.removeOptimisticUpdate(id);
    throw error;
  }
}

export async function getCustomUrlsByEntity(entityType: CustomUrl['entity_type'], entityId: string) {
  const { data, error } = await supabase
    .from('custom_urls')
    .select()
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);

  if (error) throw error;
  return data as CustomUrl[];
}

export async function deleteCustomUrl(id: string) {
  const { error } = await supabase
    .from('custom_urls')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getCustomUrl(path: string) {
  const { data, error } = await supabase
    .from('custom_urls')
    .select()
    .eq('custom_path', path)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as CustomUrl;
}

export async function getOriginalUrl(customPath: string) {
  const customUrl = await getCustomUrl(customPath);
  return customUrl?.original_path;
}

export async function getEntityCustomUrl(entityType: CustomUrl['entity_type'], entityId: string) {
  const { data, error } = await supabase
    .from('custom_urls')
    .select()
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as CustomUrl;
}

export function sanitizeUrlPath(path: string) {
  return path
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/-+/g, '-') // Replace multiple consecutive hyphens with a single hyphen
    .replace(/^-|-$/g, ''); // Remove leading and trailing hyphens
}
