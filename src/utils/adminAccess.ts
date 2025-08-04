import { supabase } from '@/integrations/supabase/client';

export const checkAdminAccess = async () => {
  try {
    // Try to access admin-only table
    const { data, error } = await supabase
      .from('admin_invitations')
      .select('count(*)', { count: 'exact' });

    if (error) {
      console.error('Admin access check failed:', error);
      return { success: false, error: 'Failed to verify admin access' };
    }

    return { success: true };
  } catch (err) {
    console.error('Admin access check error:', err);
    return { success: false, error: 'Failed to verify admin access' };
  }
};
