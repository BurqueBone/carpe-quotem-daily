export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_post_categories: {
        Row: {
          blog_post_id: string
          category_id: string
          created_at: string
          id: string
        }
        Insert: {
          blog_post_id: string
          category_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blog_post_id?: string
          category_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_categories_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          blog_focus: Database["public"]["Enums"]["blog_focus_type"] | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          blog_focus?: Database["public"]["Enums"]["blog_focus_type"] | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          blog_focus?: Database["public"]["Enums"]["blog_focus_type"] | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string
          icon_name: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          icon_name: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          description: string | null
          html_content: string
          id: string
          is_active: boolean
          subject: string
          template_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          html_content: string
          id?: string
          is_active?: boolean
          subject: string
          template_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          html_content?: string
          id?: string
          is_active?: boolean
          subject?: string
          template_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_webhook_dedup: {
        Row: {
          created_at: string
          email_action_type: string | null
          token_hash: string
        }
        Insert: {
          created_at?: string
          email_action_type?: string | null
          token_hash: string
        }
        Update: {
          created_at?: string
          email_action_type?: string | null
          token_hash?: string
        }
        Relationships: []
      }
      notification_sends: {
        Row: {
          id: string
          quote_id: string | null
          sent_at: string
          user_id: string
        }
        Insert: {
          id?: string
          quote_id?: string | null
          sent_at?: string
          user_id: string
        }
        Update: {
          id?: string
          quote_id?: string | null
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_sends_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          enabled: boolean
          period: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          period?: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          period?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birthdate: string | null
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          birthdate?: string | null
          created_at?: string
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          birthdate?: string | null
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          author: string
          created_at: string
          display_count: number | null
          display_queue: string
          id: string
          is_published: boolean
          last_displayed_at: string | null
          quote: string
          source: string | null
          updated_at: string
        }
        Insert: {
          author: string
          created_at?: string
          display_count?: number | null
          display_queue: string
          id?: string
          is_published?: boolean
          last_displayed_at?: string | null
          quote: string
          source?: string | null
          updated_at?: string
        }
        Update: {
          author?: string
          created_at?: string
          display_count?: number | null
          display_queue?: string
          id?: string
          is_published?: boolean
          last_displayed_at?: string | null
          quote?: string
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resource_upvotes: {
        Row: {
          created_at: string
          id: string
          resource_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resource_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_upvotes_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          affiliate_url: string | null
          category_id: string
          created_at: string
          date_display_reference: string | null
          description: string
          has_affiliate: boolean
          how_resource_helps: string | null
          id: string
          ispublished: boolean
          s4k_favorite: boolean
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          affiliate_url?: string | null
          category_id: string
          created_at?: string
          date_display_reference?: string | null
          description: string
          has_affiliate?: boolean
          how_resource_helps?: string | null
          id?: string
          ispublished?: boolean
          s4k_favorite?: boolean
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          affiliate_url?: string | null
          category_id?: string
          created_at?: string
          date_display_reference?: string | null
          description?: string
          has_affiliate?: boolean
          how_resource_helps?: string | null
          id?: string
          ispublished?: boolean
          s4k_favorite?: boolean
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      security_logs: {
        Row: {
          action: string
          id: string
          ip_address: unknown
          table_name: string
          target_user_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown
          table_name: string
          target_user_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown
          table_name?: string
          target_user_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      template_variables: {
        Row: {
          category: Database["public"]["Enums"]["template_variable_category"]
          created_at: string
          data_type: Database["public"]["Enums"]["template_variable_data_type"]
          default_value: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          is_system: boolean
          updated_at: string
          variable_name: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["template_variable_category"]
          created_at?: string
          data_type?: Database["public"]["Enums"]["template_variable_data_type"]
          default_value?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          updated_at?: string
          variable_name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["template_variable_category"]
          created_at?: string
          data_type?: Database["public"]["Enums"]["template_variable_data_type"]
          default_value?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          updated_at?: string
          variable_name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_random_quote_and_track: {
        Args: never
        Returns: {
          author: string
          display_count: number
          id: string
          last_displayed_at: string
          quote: string
          source: string
        }[]
      }
      get_resources_with_upvotes: {
        Args: { user_id_param?: string }
        Returns: {
          affiliate_url: string
          category_id: string
          created_at: string
          description: string
          has_affiliate: boolean
          how_resource_helps: string
          id: string
          ispublished: boolean
          title: string
          type: string
          upvote_count: number
          url: string
          user_has_upvoted: boolean
        }[]
      }
      get_scheduled_resource: {
        Args: never
        Returns: {
          affiliate_url: string
          category_id: string
          description: string
          has_affiliate: boolean
          how_resource_helps: string
          id: string
          title: string
          type: string
          url: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      blog_focus_type:
        | "resource_review"
        | "memento_mori_research"
        | "meaningful_life"
      template_variable_category: "system" | "user" | "content" | "custom"
      template_variable_data_type:
        | "text"
        | "url"
        | "date"
        | "boolean"
        | "number"
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
    Enums: {
      app_role: ["admin", "user"],
      blog_focus_type: [
        "resource_review",
        "memento_mori_research",
        "meaningful_life",
      ],
      template_variable_category: ["system", "user", "content", "custom"],
      template_variable_data_type: ["text", "url", "date", "boolean", "number"],
    },
  },
} as const
