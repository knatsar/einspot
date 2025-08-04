import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  mfaEnabled: boolean;
  error: Error | null;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setMfaEnabled: (enabled: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  initialized: false,
  mfaEnabled: false,
  error: null,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setMfaEnabled: (enabled) => set({ mfaEnabled: enabled }),

  initialize: async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null });

      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          set({ session, user: session?.user ?? null });

          // Check MFA status when session changes
          if (session?.user) {
            const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
            set({ mfaEnabled: mfaData?.currentLevel === 'aal2' });
          }
        }
      );

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      await supabase.auth.signOut();
      set({
        session: null,
        user: null,
        mfaEnabled: false,
      });
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ loading: false });
    }
  },
}));

// Initialize auth state when the store is first used
useAuthStore.getState().initialize();
