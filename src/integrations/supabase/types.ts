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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      credit_transactions: {
        Row: {
          amount: number
          amount_krw: number | null
          created_at: string
          id: string
          note: string | null
          package_id: string | null
          reason: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          amount_krw?: number | null
          created_at?: string
          id?: string
          note?: string | null
          package_id?: string | null
          reason: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          amount_krw?: number | null
          created_at?: string
          id?: string
          note?: string | null
          package_id?: string | null
          reason?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feedback_reports: {
        Row: {
          academic: number | null
          corrections: Json
          created_at: string
          fluency: number | null
          grammar: number | null
          id: string
          improvements: Json
          model: string
          organisation: number | null
          overall_score: number | null
          pronunciation: number | null
          session_id: string
          strengths: Json
          summary: string
          user_id: string
          vocabulary: number | null
        }
        Insert: {
          academic?: number | null
          corrections?: Json
          created_at?: string
          fluency?: number | null
          grammar?: number | null
          id?: string
          improvements?: Json
          model: string
          organisation?: number | null
          overall_score?: number | null
          pronunciation?: number | null
          session_id: string
          strengths?: Json
          summary: string
          user_id: string
          vocabulary?: number | null
        }
        Update: {
          academic?: number | null
          corrections?: Json
          created_at?: string
          fluency?: number | null
          grammar?: number | null
          id?: string
          improvements?: Json
          model?: string
          organisation?: number | null
          overall_score?: number | null
          pronunciation?: number | null
          session_id?: string
          strengths?: Json
          summary?: string
          user_id?: string
          vocabulary?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_reports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      group_room_members: {
        Row: {
          display_name: string
          id: string
          joined_at: string
          role: string
          room_id: string
          user_id: string
        }
        Insert: {
          display_name: string
          id?: string
          joined_at?: string
          role?: string
          room_id: string
          user_id: string
        }
        Update: {
          display_name?: string
          id?: string
          joined_at?: string
          role?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "group_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      group_rooms: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          owner_id: string
          script: string
          sections: Json
          total_minutes: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          owner_id: string
          script?: string
          sections?: Json
          total_minutes?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          script?: string
          sections?: Json
          total_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      institution_domains: {
        Row: {
          created_at: string
          domain: string
          id: string
          institution_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          institution_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          institution_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_domains_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_invite_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          institution_id: string
          max_uses: number | null
          uses: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          institution_id: string
          max_uses?: number | null
          uses?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          institution_id?: string
          max_uses?: number | null
          uses?: number
        }
        Relationships: [
          {
            foreignKeyName: "institution_invite_codes_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_members: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          joined_via: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          joined_via: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          joined_via?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_members_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_pending_invites: {
        Row: {
          created_at: string
          email: string
          id: string
          institution_id: string
          invited_by: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          institution_id: string
          invited_by?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          institution_id?: string
          invited_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_pending_invites_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          active: boolean
          created_at: string
          id: string
          licence_ends_at: string | null
          licence_starts_at: string | null
          name: string
          seats: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          licence_ends_at?: string | null
          licence_starts_at?: string | null
          name: string
          seats?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          licence_ends_at?: string | null
          licence_starts_at?: string | null
          name?: string
          seats?: number
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          ai_turns: number
          billing: string
          completed_at: string | null
          created_at: string
          difficulty: string | null
          duration_seconds: number | null
          id: string
          institution_id: string | null
          scenario: string | null
          script_file_id: string | null
          script_text: string | null
          slides_file_id: string | null
          status: string
          target_seconds: number | null
          topic: string
          type: string
          user_id: string
        }
        Insert: {
          ai_turns?: number
          billing: string
          completed_at?: string | null
          created_at?: string
          difficulty?: string | null
          duration_seconds?: number | null
          id?: string
          institution_id?: string | null
          scenario?: string | null
          script_file_id?: string | null
          script_text?: string | null
          slides_file_id?: string | null
          status?: string
          target_seconds?: number | null
          topic?: string
          type: string
          user_id: string
        }
        Update: {
          ai_turns?: number
          billing?: string
          completed_at?: string | null
          created_at?: string
          difficulty?: string | null
          duration_seconds?: number | null
          id?: string
          institution_id?: string | null
          scenario?: string | null
          script_file_id?: string | null
          script_text?: string | null
          slides_file_id?: string | null
          status?: string
          target_seconds?: number | null
          topic?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_sessions_script_file_id_fkey"
            columns: ["script_file_id"]
            isOneToOne: false
            referencedRelation: "presentation_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_sessions_slides_file_id_fkey"
            columns: ["slides_file_id"]
            isOneToOne: false
            referencedRelation: "presentation_files"
            referencedColumns: ["id"]
          },
        ]
      }
      presentation_files: {
        Row: {
          created_at: string
          id: string
          kind: string
          mime_type: string
          original_name: string
          size_bytes: number
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          mime_type: string
          original_name: string
          size_bytes: number
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          mime_type?: string
          original_name?: string
          size_bytes?: number
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          interface_language: string
          korean_level: string
          learning_goals: string[]
          major: string
          university: string
          updated_at: string
          weekly_minutes: number
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          interface_language?: string
          korean_level?: string
          learning_goals?: string[]
          major?: string
          university?: string
          updated_at?: string
          weekly_minutes?: number
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          interface_language?: string
          korean_level?: string
          learning_goals?: string[]
          major?: string
          university?: string
          updated_at?: string
          weekly_minutes?: number
        }
        Relationships: []
      }
      session_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          recording_path: string | null
          role: string
          session_id: string
          source: string
          translation: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          recording_path?: string | null
          role: string
          session_id: string
          source?: string
          translation?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          recording_path?: string | null
          role?: string
          session_id?: string
          source?: string
          translation?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      active_licence_for: { Args: { _user_id: string }; Returns: string }
      admin_add_institution_member: {
        Args: { _email: string; _institution_id: string }
        Returns: string
      }
      admin_create_institution_code: {
        Args: {
          _code: string
          _expires_at: string
          _institution_id: string
          _max_uses: number
        }
        Returns: string
      }
      admin_remove_institution_member: {
        Args: { _institution_id: string; _user_id: string }
        Returns: undefined
      }
      create_group_room: {
        Args: {
          _display_name: string
          _name: string
          _script: string
          _sections: Json
          _total_minutes: number
        }
        Returns: string
      }
      credit_balance_of: { Args: { _user_id: string }; Returns: number }
      get_my_credit_balance: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      institution_has_free_seat: {
        Args: { _institution_id: string }
        Returns: boolean
      }
      institution_licence_is_current: {
        Args: { _institution_id: string }
        Returns: boolean
      }
      is_institution_admin: {
        Args: { _institution_id: string; _user_id: string }
        Returns: boolean
      }
      is_institution_member: {
        Args: { _institution_id: string; _user_id: string }
        Returns: boolean
      }
      is_room_member: {
        Args: { _room_id: string; _user_id: string }
        Returns: boolean
      }
      join_group_room: {
        Args: { _code: string; _display_name: string }
        Returns: string
      }
      redeem_institution_code: { Args: { _code: string }; Returns: string }
      start_practice_session: {
        Args: {
          _difficulty: string
          _scenario: string
          _script_file_id: string
          _script_text: string
          _slides_file_id: string
          _target_seconds: number
          _topic: string
          _type: string
        }
        Returns: string
      }
      sync_my_institution_access: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
    },
  },
} as const
