import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export type AuthProvider = 'google' | 'github' | 'twitter';

interface AuthError {
  message: string;
  status: number;
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      data: null,
      error: {
        message: (error as AuthError).message || 'Failed to sign in',
        status: (error as AuthError).status || 500,
      },
    };
  }
}

export async function signInWithProvider(provider: AuthProvider) {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'email profile',
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('OAuth sign in error:', error);
    return {
      data: null,
      error: {
        message: (error as AuthError).message || 'Failed to sign in',
        status: (error as AuthError).status || 500,
      },
    };
  }
}

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          role: 'customer',
        },
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      data: null,
      error: {
        message: (error as AuthError).message || 'Failed to sign up',
        status: (error as AuthError).status || 500,
      },
    };
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      error: {
        message: (error as AuthError).message || 'Failed to send reset email',
        status: (error as AuthError).status || 500,
      },
    };
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Password update error:', error);
    return {
      error: {
        message: (error as AuthError).message || 'Failed to update password',
        status: (error as AuthError).status || 500,
      },
    };
  }
}

export async function setupMFA() {
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('MFA setup error:', error);
    return {
      data: null,
      error: {
        message: (error as AuthError).message || 'Failed to setup MFA',
        status: (error as AuthError).status || 500,
      },
    };
  }
}

export async function verifyMFA(code: string) {
  try {
    const { data, error } = await supabase.auth.mfa.verify({
      factorId: 'totp',
      code,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('MFA verification error:', error);
    return {
      data: null,
      error: {
        message: (error as AuthError).message || 'Failed to verify MFA code',
        status: (error as AuthError).status || 500,
      },
    };
  }
}

export async function challengeMFA() {
  try {
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId: 'totp',
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('MFA challenge error:', error);
    return {
      data: null,
      error: {
        message: (error as AuthError).message || 'Failed to generate MFA challenge',
        status: (error as AuthError).status || 500,
      },
    };
  }
}

export function handleAuthError(error: AuthError) {
  toast({
    title: 'Authentication Error',
    description: error.message,
    variant: 'destructive',
  });
}
