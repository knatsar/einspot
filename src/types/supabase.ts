export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_invitations: {
        Row: {
          id: string
          email: string
          role: string
          invited_by: string
          status: string
          invited_at: string
          expires_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          email: string
          role?: string
          invited_by: string
          status?: string
          invited_at?: string
          expires_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: string
          invited_by?: string
          status?: string
          invited_at?: string
          expires_at?: string
          accepted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      menu_items: {
        Row: {
          id: string
          label: string
          url: string
          icon: string | null
          parent_id: string | null
          order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          label: string
          url: string
          icon?: string | null
          parent_id?: string | null
          order?: number
          is_visible?: boolean
        }
        Update: {
          label?: string
          url?: string
          icon?: string | null
          parent_id?: string | null
          order?: number
          is_visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          }
        ]
      }
      custom_urls: {
        Row: {
          id: string
          original_path: string
          custom_path: string
          entity_type: string
          entity_id: string
          is_active: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          original_path: string
          custom_path: string
          entity_type: string
          entity_id: string
          is_active?: boolean
          metadata?: Json
        }
        Update: {
          original_path?: string
          custom_path?: string
          entity_type?: string
          entity_id?: string
          is_active?: boolean
          metadata?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "user" | "admin" | "superadmin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
