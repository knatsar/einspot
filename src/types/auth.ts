import { User } from '@supabase/supabase-js'

export type UserRole = 'user' | 'admin' | 'superadmin'

export interface Profile {
  id: string
  email: string
  role: UserRole
  updated_at?: string
  created_at?: string
}

export interface AdminInvitation {
  id: string
  email: string
  role: UserRole
  invited_by: string
  status: 'pending' | 'accepted' | 'expired'
  invited_at: string
  expires_at: string
  accepted_at?: string
}

export interface AuthState {
  user: User | null
  profile: Profile | null
  userRole: UserRole | null
  loading: boolean
  error: string | null
}
