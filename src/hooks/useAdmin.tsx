import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { UserRole, AdminInvitation } from '@/types/auth';

interface AdminContextType {
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userRole } = useAuth();
  const { toast } = useToast();

  const clearError = () => setError(null);

  const verifyAdminAccess = useCallback(async () => {
    try {
      // Verify admin access with a simple query
      const { error } = await supabase
        .from('admin_invitations')
        .select('count(*)', { count: 'exact' });

      if (error) throw error;
    } catch (err) {
      console.error('Admin access verification failed:', err);
      setError('Failed to verify admin access. Please try again.');
      toast({
        title: "Access Error",
        description: "Failed to verify admin permissions",
        variant: "destructive"
      });
    }
  }, [toast]);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    await verifyAdminAccess();
    setLoading(false);
  };

  useEffect(() => {
    if (user && (userRole === 'admin' || userRole === 'superadmin')) {
      verifyAdminAccess();
    } else {
      setLoading(false);
    }
  }, [user, userRole, verifyAdminAccess]);

  return (
    <AdminContext.Provider value={{ loading, error, clearError, refreshData }}>
      {children}
    </AdminContext.Provider>
  );
};

export { AdminContext };
export type { AdminContextType };
