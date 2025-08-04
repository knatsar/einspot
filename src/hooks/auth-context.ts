import { createContext } from 'react';
import type { User, AuthError } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
