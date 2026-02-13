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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_prompt_versions: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          prompt_id: string
          version_number: number
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          prompt_id: string
          version_number: number
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          prompt_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompt_versions_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_likes: {
        Row: {
          created_at: string
          id: string
          post_slug: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_slug: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_slug?: string
          visitor_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          category_en: string
          category_ja: string
          content_en: string
          content_ja: string
          created_at: string
          date_en: string
          date_ja: string
          excerpt_en: string
          excerpt_ja: string
          featured: boolean
          id: string
          image: string | null
          published_at: string | null
          slug: string
          status: string
          title_en: string
          title_ja: string
          updated_at: string
        }
        Insert: {
          category_en: string
          category_ja: string
          content_en: string
          content_ja: string
          created_at?: string
          date_en: string
          date_ja: string
          excerpt_en: string
          excerpt_ja: string
          featured?: boolean
          id?: string
          image?: string | null
          published_at?: string | null
          slug: string
          status?: string
          title_en: string
          title_ja: string
          updated_at?: string
        }
        Update: {
          category_en?: string
          category_ja?: string
          content_en?: string
          content_ja?: string
          created_at?: string
          date_en?: string
          date_ja?: string
          excerpt_en?: string
          excerpt_ja?: string
          featured?: boolean
          id?: string
          image?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          title_en?: string
          title_ja?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_share_counts: {
        Row: {
          created_at: string
          facebook_count: number
          hatena_count: number
          id: string
          post_slug: string
          twitter_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          facebook_count?: number
          hatena_count?: number
          id?: string
          post_slug: string
          twitter_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          facebook_count?: number
          hatena_count?: number
          id?: string
          post_slug?: string
          twitter_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      blog_suggested_questions: {
        Row: {
          created_at: string
          id: string
          post_slug: string
          questions_en: Json
          questions_ja: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_slug: string
          questions_en?: Json
          questions_ja?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          post_slug?: string
          questions_en?: Json
          questions_ja?: Json
          updated_at?: string
        }
        Relationships: []
      }
      blog_summaries: {
        Row: {
          created_at: string
          id: string
          post_slug: string
          summary_en: string
          summary_ja: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_slug: string
          summary_en: string
          summary_ja: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          post_slug?: string
          summary_en?: string
          summary_ja?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_views: {
        Row: {
          created_at: string
          id: string
          post_slug: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_slug: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_slug?: string
          visitor_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      chat_message_feedback: {
        Row: {
          created_at: string
          feedback_note: string | null
          id: string
          message_id: string
          rating: string
          reviewed_by: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          feedback_note?: string | null
          id?: string
          message_id: string
          rating: string
          reviewed_by?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          feedback_note?: string | null
          id?: string
          message_id?: string
          rating?: string
          reviewed_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_message_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: true
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      elio_signups: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      feature_requests: {
        Row: {
          blog_slug: string | null
          content: string
          created_at: string
          id: string
          source: string | null
          visitor_id: string | null
        }
        Insert: {
          blog_slug?: string | null
          content: string
          created_at?: string
          id?: string
          source?: string | null
          visitor_id?: string | null
        }
        Update: {
          blog_slug?: string | null
          content?: string
          created_at?: string
          id?: string
          source?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          blog_slug: string | null
          content: string
          created_at: string
          id: string
          parent_id: string | null
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blog_slug?: string | null
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blog_slug?: string | null
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      game_high_scores: {
        Row: {
          created_at: string
          game_type: string
          id: string
          player_name: string
          score: number
        }
        Insert: {
          created_at?: string
          game_type?: string
          id?: string
          player_name: string
          score: number
        }
        Update: {
          created_at?: string
          game_type?: string
          id?: string
          player_name?: string
          score?: number
        }
        Relationships: []
      }
      music_play_counts: {
        Row: {
          created_at: string
          id: string
          track_id: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          track_id: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          track_id?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "music_play_counts_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      music_tracks: {
        Row: {
          artist: string
          artwork: string | null
          color: string | null
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          lyrics: Json | null
          src: string
          title: string
          updated_at: string
        }
        Insert: {
          artist?: string
          artwork?: string | null
          color?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          lyrics?: Json | null
          src: string
          title: string
          updated_at?: string
        }
        Update: {
          artist?: string
          artwork?: string | null
          color?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          lyrics?: Json | null
          src?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          interests: string[] | null
          name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interests?: string[] | null
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interests?: string[] | null
          name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          public_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          public_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          public_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_blog_analytics: {
        Args: never
        Returns: {
          first_view_at: string
          last_view_at: string
          like_count: number
          post_slug: string
          unique_visitors: number
          view_count: number
        }[]
      }
      get_blog_like_count: { Args: { p_post_slug: string }; Returns: number }
      get_blog_view_count: { Args: { p_post_slug: string }; Returns: number }
      get_forum_comments_safe: {
        Args: { p_blog_slug?: string; p_topic_id?: string }
        Returns: {
          author_avatar_url: string
          author_display_name: string
          author_public_id: string
          blog_slug: string
          content: string
          created_at: string
          id: string
          parent_id: string
          topic_id: string
          updated_at: string
        }[]
      }
      get_forum_profile: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          display_name: string
          public_id: string
        }[]
      }
      get_forum_topics_safe: {
        Args: never
        Returns: {
          author_avatar_url: string
          author_display_name: string
          author_public_id: string
          category: string
          comment_count: number
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          title: string
          updated_at: string
          view_count: number
        }[]
      }
      get_music_play_counts: {
        Args: never
        Returns: {
          play_count: number
          track_id: string
          unique_listeners: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_visitor_liked: {
        Args: { p_post_slug: string; p_visitor_id: string }
        Returns: boolean
      }
      increment_topic_view_count: {
        Args: { topic_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
