export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      custom_urls: {
        Row: {
          id: string;
          original_path: string;
          custom_path: string;
          entity_type: string;
          entity_id: string;
          is_active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          original_path: string;
          custom_path: string;
          entity_type: string;
          entity_id: string;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          original_path?: string;
          custom_path?: string;
          entity_type?: string;
          entity_id?: string;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_invitations: {
        Row: {
          accepted_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          ip_address: string | null
          page_url: string | null
          properties: Json | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          properties?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          properties?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      backup_logs: {
        Row: {
          backup_type: string
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          status: string
        }
        Insert: {
          backup_type: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          status: string
        }
        Update: {
          backup_type?: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          status?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chat_config: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean | null
          position: string | null
          theme_color: string | null
          updated_at: string
          welcome_message: string | null
          whatsapp_number: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          position?: string | null
          theme_color?: string | null
          updated_at?: string
          welcome_message?: string | null
          whatsapp_number?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          position?: string | null
          theme_color?: string | null
          updated_at?: string
          welcome_message?: string | null
          whatsapp_number?: string
        }
        Relationships: []
      }
      content_sections: {
        Row: {
          button_link: string | null
          button_text: string | null
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean | null
          section_key: string
          sort_order: number | null
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          section_key: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          section_key?: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      currency_settings: {
        Row: {
          created_at: string
          currency_code: string
          currency_name: string
          currency_symbol: string
          exchange_rate: number | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          symbol_position: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_code: string
          currency_name: string
          currency_symbol: string
          exchange_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          symbol_position?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          currency_name?: string
          currency_symbol?: string
          exchange_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          symbol_position?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          html_content: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_key: string
          text_content: string | null
          updated_at: string
          variables: Json | null
        }
        Insert: {
          created_at?: string
          html_content: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_key: string
          text_content?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          created_at?: string
          html_content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_key?: string
          text_content?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      language_settings: {
        Row: {
          auto_translate: boolean | null
          created_at: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          language_code: string
          language_name: string
          updated_at: string
        }
        Insert: {
          auto_translate?: boolean | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          language_code: string
          language_name: string
          updated_at?: string
        }
        Update: {
          auto_translate?: boolean | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          language_code?: string
          language_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
          status: string | null
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
          status?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
          status?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          order_number: string
          quotation_id: string | null
          shipping_address: Json | null
          status: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          order_number: string
          quotation_id?: string | null
          shipping_address?: Json | null
          status?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          order_number?: string
          quotation_id?: string | null
          shipping_address?: Json | null
          status?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateways: {
        Row: {
          configuration: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          description: string | null
          features: string | null
          gallery_images: string[] | null
          id: string
          image_url: string | null
          installation_manual_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          model_number: string | null
          name: string
          price: number | null
          quote_available: boolean | null
          show_price: boolean | null
          specifications: Json | null
          stock_status: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string
          description?: string | null
          features?: string | null
          gallery_images?: string[] | null
          id?: string
          image_url?: string | null
          installation_manual_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          model_number?: string | null
          name: string
          price?: number | null
          quote_available?: boolean | null
          show_price?: boolean | null
          specifications?: Json | null
          stock_status?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          description?: string | null
          features?: string | null
          gallery_images?: string[] | null
          id?: string
          image_url?: string | null
          installation_manual_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          model_number?: string | null
          name?: string
          price?: number | null
          quote_available?: boolean | null
          show_price?: boolean | null
          specifications?: Json | null
          stock_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string | null
          client: string | null
          client_feedback: string | null
          client_feedback_author: string | null
          client_name: string | null
          completion_date: string | null
          created_at: string
          description: string | null
          duration: string | null
          excerpt: string | null
          featured_image: string | null
          focus_keyphrase: string | null
          gallery_images: string[] | null
          id: string
          is_featured: boolean | null
          key_features: string | null
          keyphrase_slug: string | null
          location: string | null
          meta_description: string | null
          process_overview: string | null
          project_summary: string | null
          status: string | null
          synonyms: string | null
          tags: string[] | null
          technology_used: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          client?: string | null
          client_feedback?: string | null
          client_feedback_author?: string | null
          client_name?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          excerpt?: string | null
          featured_image?: string | null
          focus_keyphrase?: string | null
          gallery_images?: string[] | null
          id?: string
          is_featured?: boolean | null
          key_features?: string | null
          keyphrase_slug?: string | null
          location?: string | null
          meta_description?: string | null
          process_overview?: string | null
          project_summary?: string | null
          status?: string | null
          synonyms?: string | null
          tags?: string[] | null
          technology_used?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          client?: string | null
          client_feedback?: string | null
          client_feedback_author?: string | null
          client_name?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          excerpt?: string | null
          featured_image?: string | null
          focus_keyphrase?: string | null
          gallery_images?: string[] | null
          id?: string
          is_featured?: boolean | null
          key_features?: string | null
          keyphrase_slug?: string | null
          location?: string | null
          meta_description?: string | null
          process_overview?: string | null
          project_summary?: string | null
          status?: string | null
          synonyms?: string | null
          tags?: string[] | null
          technology_used?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotations: {
        Row: {
          admin_notes: string | null
          created_at: string
          customer_id: string
          id: string
          message: string | null
          product_id: string
          quantity: number
          quoted_price: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          customer_id: string
          id?: string
          message?: string | null
          product_id: string
          quantity?: number
          quoted_price?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          message?: string | null
          product_id?: string
          quantity?: number
          quoted_price?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quotations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      role_audit_log: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_role: string
          old_role: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_role: string
          old_role?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_role?: string
          old_role?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      smtp_settings: {
        Row: {
          created_at: string
          encryption: string | null
          from_email: string
          from_name: string
          host: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          password: string
          port: number
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          encryption?: string | null
          from_email: string
          from_name: string
          host: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          password: string
          port: number
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          encryption?: string | null
          from_email?: string
          from_name?: string
          host?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          password?: string
          port?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      system_health_logs: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          status?: string
        }
        Relationships: []
      }
      themes: {
        Row: {
          created_at: string
          description: string | null
          hero_config: Json | null
          id: string
          is_active: boolean | null
          layout_config: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hero_config?: Json | null
          id?: string
          is_active?: boolean | null
          layout_config?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hero_config?: Json | null
          id?: string
          is_active?: boolean | null
          layout_config?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_role_requests: {
        Row: {
          created_at: string | null
          id: string
          reason: string | null
          requested_by: string | null
          requested_role: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason?: string | null
          requested_by?: string | null
          requested_role: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string | null
          requested_by?: string | null
          requested_role?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          contact_name: string | null
          created_at: string
          id: string
          message: string
          phone_number: string
          response_sent: boolean | null
          status: string
          updated_at: string
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          id?: string
          message: string
          phone_number: string
          response_sent?: boolean | null
          status?: string
          updated_at?: string
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          id?: string
          message?: string
          phone_number?: string
          response_sent?: boolean | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      change_user_role: {
        Args: { target_user_id: string; new_role: string; reason?: string }
        Returns: boolean
      }
      ensure_default_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
