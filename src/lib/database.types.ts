export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          message: string
          link: string | null
          read: boolean
          created_at: string
          data: Json
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          message: string
          link?: string | null
          read?: boolean
          created_at?: string
          data?: Json
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          message?: string
          link?: string | null
          read?: boolean
          created_at?: string
          data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      content_versions: {
        Row: {
          id: string
          entity_type: 'anime' | 'character'
          content_type: 'character_description' | 'anime_synopsis' | 'anime_background'
          entity_id: number
          language: string
          content: string
          original_content: string | null; // ✅ Tambahkan ini
          status: 'pending' | 'approved' | 'rejected'
          created_by: string
          created_at: string
          updated_at: string | null
          rejected_at: string | null
        }
        Insert: {
          id?: string
          entity_type: 'anime' | 'character'
          content_type: 'character_description' | 'anime_synopsis' | 'anime_background'
          entity_id: number
          language: string
          content: string
          original_content?: string | null; // ✅ Tambahkan ini
          status?: 'pending' | 'approved' | 'rejected'
          created_by: string
          created_at?: string
          updated_at?: string | null
          rejected_at?: string | null
        }
        Update: {
          id?: string
          entity_type?: 'anime' | 'character'
          content_type?: 'character_description' | 'anime_synopsis' | 'anime_background'
          entity_id?: number
          language?: string
          content?: string
          original_content?: string | null; // ✅ Tambahkan ini
          status?: 'pending' | 'approved' | 'rejected'
          created_by?: string
          created_at?: string
          updated_at?: string | null
          rejected_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_versions_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      content_versions_history: {
        Row: {
          id: number
          version_id: string
          content_type: string
          entity_id: number
          language: string
          content: string
          status: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: number
          version_id: string
          content_type: string
          entity_id: number
          language: string
          content: string
          status: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: number
          version_id?: string
          content_type?: string
          entity_id?: number
          language?: string
          content?: string
          status?: string
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_versions_history_version_id_fkey"
            columns: ["version_id"]
            referencedRelation: "content_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_versions_history_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      threads: {
        Row: {
          id: string
          title: string
          anime_id: number
          content: string;
          created_by: string
          created_at: string
          language: string
          category: string; // ➡️ Optional
        }
        Insert: {
          id?: string
          title: string
          anime_id: number
          content?: string;
          created_by: string
          created_at?: string
          language: string
          category?: string; // ➡️ Optional
        }
        Update: {
          id?: string
          title?: string
          anime_id: number
          content?: string;
          created_by?: string
          created_at?: string
          language?: string
          category?: string; // ➡️ Optional
        }
        Relationships: [
          {
            foreignKeyName: "threads_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      posts: {
        Row: {
          id: string
          thread_id: string
          content: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          content: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          content?: string
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_thread_id_fkey"
            columns: ["thread_id"]
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      bookmarks: {
        Row: {
          category: string
          created_at: string
          id: string
          entity_id: number
          entity_type: 'anime' | 'character'
          user_id: string
          title: string
          title_english: string | null
          image_url: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          entity_id: number
          entity_type?: 'anime' | 'character'
          user_id?: string
          title?: string
          title_english?: string | null
          image_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          entity_id?: number
          entity_type?: 'anime' | 'character'
          user_id?: string
          title?: string
          title_english?: string | null
          image_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_type: string
          achieved_at: string
          level: number
          points: number
        }
        Insert: {
          id?: string
          user_id: string
          achievement_type: string
          achieved_at?: string
          level?: number
          points?: number
        }
        Update: {
          id?: string
          user_id?: string
          achievement_type?: string
          achieved_at?: string
          level?: number
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_points: {
        Row: {
          id: string
          user_id: string
          points: number
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          points?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          points?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          language_preferences: string[] | null
          updated_at: string | null
          username: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          language_preferences?: string[] | null
          updated_at?: string | null
          username?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          language_preferences?: string[] | null
          updated_at?: string | null
          username?: string | null
          role?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          jikan_id: number
          rating: number
          review: string | null
          user_id: string
          language: string
        }
        Insert: {
          created_at?: string
          id?: string
          jikan_id: number
          rating?: number
          review?: string | null
          user_id?: string
          language?: string
        }
        Update: {
          created_at?: string
          id?: string
          jikan_id?: number
          rating?: number
          review?: string | null
          user_id?: string
          language?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never;