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
      announcements: {
        Row: {
          content: string
          created_at: string
          id: string
          priority: string
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          priority: string
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          priority?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      attendance_limits: {
        Row: {
          absent_days: number | null
          created_at: string
          exceeds_limit: boolean | null
          id: string
          leave_days: number | null
          month: string
          noc_days: number | null
          team_member_id: string
          user_id: string | null
        }
        Insert: {
          absent_days?: number | null
          created_at?: string
          exceeds_limit?: boolean | null
          id?: string
          leave_days?: number | null
          month: string
          noc_days?: number | null
          team_member_id: string
          user_id?: string | null
        }
        Update: {
          absent_days?: number | null
          created_at?: string
          exceeds_limit?: boolean | null
          id?: string
          leave_days?: number | null
          month?: string
          noc_days?: number | null
          team_member_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_limits_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          status: string
          team_member_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          status: string
          team_member_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          status?: string
          team_member_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_attendance_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      match_history: {
        Row: {
          created_at: string
          date: string
          id: string
          opponent: string
          score: string
          tier: string
          tournament: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          opponent: string
          score: string
          tier: string
          tournament: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          opponent?: string
          score?: string
          tier?: string
          tournament?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      noc_history: {
        Row: {
          action: string
          action_timestamp: string
          created_at: string
          email: string
          end_date: string
          id: string
          noc_id: string | null
          player_name: string
          reason: string
          start_date: string
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          action: string
          action_timestamp?: string
          created_at?: string
          email: string
          end_date: string
          id?: string
          noc_id?: string | null
          player_name: string
          reason: string
          start_date: string
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          action?: string
          action_timestamp?: string
          created_at?: string
          email?: string
          end_date?: string
          id?: string
          noc_id?: string | null
          player_name?: string
          reason?: string
          start_date?: string
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "noc_history_noc_id_fkey"
            columns: ["noc_id"]
            isOneToOne: false
            referencedRelation: "noc_records"
            referencedColumns: ["id"]
          },
        ]
      }
      noc_records: {
        Row: {
          created_at: string
          email: string
          end_date: string
          id: string
          player_name: string
          reason: string
          start_date: string
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          end_date: string
          id?: string
          player_name: string
          reason: string
          start_date: string
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          end_date?: string
          id?: string
          player_name?: string
          reason?: string
          start_date?: string
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          absent_days: number | null
          birthdate: string
          created_at: string
          current_month_absents: number | null
          current_month_leaves: number | null
          discord_id: string
          email: string
          facebook: string
          game_role: string
          id: string
          ign: string
          leave_days: number | null
          noc_days: number | null
          phone: string
          picture: string | null
          real_name: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          absent_days?: number | null
          birthdate: string
          created_at?: string
          current_month_absents?: number | null
          current_month_leaves?: number | null
          discord_id: string
          email: string
          facebook: string
          game_role: string
          id?: string
          ign: string
          leave_days?: number | null
          noc_days?: number | null
          phone: string
          picture?: string | null
          real_name: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          absent_days?: number | null
          birthdate?: string
          created_at?: string
          current_month_absents?: number | null
          current_month_leaves?: number | null
          discord_id?: string
          email?: string
          facebook?: string
          game_role?: string
          id?: string
          ign?: string
          leave_days?: number | null
          noc_days?: number | null
          phone?: string
          picture?: string | null
          real_name?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tournaments: {
        Row: {
          created_at: string
          discord_link: string | null
          entry_fee: number | null
          hoster: string
          id: string
          location: string
          price_pool: number | null
          roster: string
          start_time: string
          status: string | null
          tournament_link: string | null
          tournament_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discord_link?: string | null
          entry_fee?: number | null
          hoster: string
          id?: string
          location: string
          price_pool?: number | null
          roster: string
          start_time: string
          status?: string | null
          tournament_link?: string | null
          tournament_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          discord_link?: string | null
          entry_fee?: number | null
          hoster?: string
          id?: string
          location?: string
          price_pool?: number | null
          roster?: string
          start_time?: string
          status?: string | null
          tournament_link?: string | null
          tournament_name?: string
          user_id?: string
        }
        Relationships: []
      }
      uploaded_files: {
        Row: {
          created_at: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          noc_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_type: string
          file_url: string
          id?: string
          noc_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          noc_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_files_noc_id_fkey"
            columns: ["noc_id"]
            isOneToOne: false
            referencedRelation: "noc_records"
            referencedColumns: ["id"]
          },
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
