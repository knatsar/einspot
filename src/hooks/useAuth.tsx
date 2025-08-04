import { useContext, useEffect, useState, useMemo } from 'react';
import type { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthContext, type AuthContextType } from './auth-context';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Memoize super admin emails
  const DEFAULT_SUPER_ADMINS = useMemo(() => [
    'admin@einspot.com', 
    'superadmin@einspot.com',
    'info@einspot.com'
  ], []);

  // Helper function to fetch or create profile
  const getOrCreateProfile = async (userId: string, email?: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116' && email) {
      // Profile doesn't exist, create it
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email: email,
          role: DEFAULT_SUPER_ADMINS.includes(email) ? 'superadmin' : 'customer',
          full_name: email.split('@')[0]
        })
        .select()
        .single();

      if (!createError && newProfile) {
        return newProfile;
      }
    }

    return profile;
  };

  useEffect(() => {
    let mounted = true;
    
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const profile = await getOrCreateProfile(session.user.id, session.user.email);
          
          if (profile) {
            setUserRole(profile.role);
          }
        }
      } catch (error) {
        console.error('Session init error:', error);
        toast({
          title: "Error",
          description: "Failed to initialize session",
          variant: "destructive"
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserRole(null);
        } else if (session?.user) {
          setUser(session.user);
          const profile = await getOrCreateProfile(session.user.id, session.user.email);
          setUserRole(profile?.role || 'customer');
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [DEFAULT_SUPER_ADMINS, toast]);

  const fetchUserRole = async (userId: string, userEmail?: string) => {
    try {
      // Removed console.log for production
      
      // Check if user is a default super admin
      const isSuperAdmin = userEmail && DEFAULT_SUPER_ADMINS.includes(userEmail.toLowerCase());
      
      // First check if profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        // Handle profile creation if doesn't exist
        if (userEmail) {
          try {
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                user_id: userId,
                email: userEmail,
                full_name: userEmail.split('@')[0],
                role: isSuperAdmin ? 'superadmin' : 'customer'
              });
            
            if (!createError) {
              setUserRole(isSuperAdmin ? 'superadmin' : 'customer');
              setLoading(false);
              return;
            }
          } catch (createErr) {
            console.error('Error creating profile:', createErr);
          }
        }
        setUserRole('customer');
        setLoading(false);
        return;
      }

      let role = existingProfile?.role || 'customer';

      // If user is a default super admin but doesn't have the role yet, update it
      if (isSuperAdmin && role !== 'superadmin') {
        role = 'superadmin';
        
        try {
          // Create or update profile with superadmin role
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              user_id: userId,
              email: userEmail,
              role: 'superadmin',
              full_name: userEmail?.split('@')[0] || 'Admin User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (upsertError) {
            console.error('Error updating superadmin profile:', upsertError);
          }
        } catch (error) {
          console.error('❌ Error updating superadmin profile:', error);
        }
      }
      
      setUserRole(role);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching user role:', error);
      const fallbackRole = userEmail && DEFAULT_SUPER_ADMINS.includes(userEmail.toLowerCase()) 
        ? 'superadmin' 
        : 'customer';
      setUserRole(fallbackRole);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state first
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Error signing out:', error);
      }
      
      // Clean up state
      setUser(null);
      setUserRole(null);
      
      // Only reload if not already on home page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    userRole,
    signIn,
    signUp,
    signOut,
    resetPassword,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth } from './use-auth';