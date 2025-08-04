import { supabase } from '@/integrations/supabase/client';

export const AUTH_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
};

let sessionTimeoutId: NodeJS.Timeout | null = null;

export function startSessionTimeout() {
  // Clear any existing timeout
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
  }

  // Get current session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) return;

    // Calculate time until session expires
    const expiresIn = new Date(session.expires_at!).getTime() - Date.now();
    const refreshIn = expiresIn - AUTH_CONFIG.REFRESH_THRESHOLD;

    // Set timeout to handle session refresh
    if (refreshIn > 0) {
      sessionTimeoutId = setTimeout(async () => {
        try {
          const { error } = await supabase.auth.refreshSession();
          if (error) {
            // If refresh fails, sign out
            await supabase.auth.signOut();
            window.location.href = '/auth';
          } else {
            // If refresh succeeds, start a new timeout
            startSessionTimeout();
          }
        } catch (err) {
          console.error('Failed to refresh session:', err);
          await supabase.auth.signOut();
          window.location.href = '/auth';
        }
      }, refreshIn);
    } else {
      // Session is already expired or close to expiring
      supabase.auth.signOut();
      window.location.href = '/auth';
    }
  });
}

export function stopSessionTimeout() {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
    sessionTimeoutId = null;
  }
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    startSessionTimeout();
  } else if (event === 'SIGNED_OUT') {
    stopSessionTimeout();
  }
});
