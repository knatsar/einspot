import { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthContext, type AuthContextType } from './auth-context';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

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
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          setUser(session.user);
          const profile = await getOrCreateProfile(session.user.id, session.user.email);
          setUserRole(profile?.role || 'customer');
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error in onAuthStateChange:", error);
        setUser(null);
        setUserRole(null);
        toast({
          title: "Authentication Error",
          description: "There was a problem verifying your session.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [DEFAULT_SUPER_ADMINS, toast]);

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
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      // The onAuthStateChange listener will handle setting user and role to null.
      navigate('/');
    } catch (error) {
      console.error('Error during sign out:', error);
      toast({
        title: "Sign Out Error",
        description: "An unexpected error occurred during sign out.",
        variant: "destructive",
      });
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};