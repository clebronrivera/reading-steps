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
      appointments: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          student_id: string
          timezone: string
          updated_at: string
          zoom_join_url: string | null
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          student_id: string
          timezone: string
          updated_at?: string
          zoom_join_url?: string | null
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          student_id?: string
          timezone?: string
          updated_at?: string
          zoom_join_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      parents: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      responses: {
        Row: {
          created_at: string
          id: string
          item_index: number
          notes: string | null
          response_time_ms: number | null
          score_code: Database["public"]["Enums"]["response_code"]
          session_id: string
          subtest_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_index: number
          notes?: string | null
          response_time_ms?: number | null
          score_code: Database["public"]["Enums"]["response_code"]
          session_id: string
          subtest_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_index?: number
          notes?: string | null
          response_time_ms?: number | null
          score_code?: Database["public"]["Enums"]["response_code"]
          session_id?: string
          subtest_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_subtest_id_fkey"
            columns: ["subtest_id"]
            isOneToOne: false
            referencedRelation: "subtests"
            referencedColumns: ["id"]
          },
        ]
      }
      session_summaries: {
        Row: {
          created_at: string
          id: string
          needs_risk_indicators: string | null
          next_steps: string | null
          observations: string | null
          recommendations_parents: string | null
          recommendations_school: string | null
          session_id: string
          strengths: string | null
          total_correct: number | null
          total_items: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          needs_risk_indicators?: string | null
          next_steps?: string | null
          observations?: string | null
          recommendations_parents?: string | null
          recommendations_school?: string | null
          session_id: string
          strengths?: string | null
          total_correct?: number | null
          total_items?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          needs_risk_indicators?: string | null
          next_steps?: string | null
          observations?: string | null
          recommendations_parents?: string | null
          recommendations_school?: string | null
          session_id?: string
          strengths?: string | null
          total_correct?: number | null
          total_items?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_summaries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          appointment_id: string | null
          assessor_id: string | null
          created_at: string
          ended_at: string | null
          id: string
          started_at: string
          student_id: string
        }
        Insert: {
          appointment_id?: string | null
          assessor_id?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          started_at?: string
          student_id: string
        }
        Update: {
          appointment_id?: string | null
          assessor_id?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          started_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          consent_record_zoom: boolean | null
          consent_screening: boolean
          consent_store_data: boolean
          created_at: string
          current_supports: string | null
          date_of_birth: string
          full_name: string
          grade: string
          id: string
          languages_at_home: string[] | null
          lead_status: Database["public"]["Enums"]["lead_status"]
          parent_id: string
          parent_observations: string | null
          primary_concerns: string[] | null
          school: string | null
          updated_at: string
        }
        Insert: {
          consent_record_zoom?: boolean | null
          consent_screening?: boolean
          consent_store_data?: boolean
          created_at?: string
          current_supports?: string | null
          date_of_birth: string
          full_name: string
          grade: string
          id?: string
          languages_at_home?: string[] | null
          lead_status?: Database["public"]["Enums"]["lead_status"]
          parent_id: string
          parent_observations?: string | null
          primary_concerns?: string[] | null
          school?: string | null
          updated_at?: string
        }
        Update: {
          consent_record_zoom?: boolean | null
          consent_screening?: boolean
          consent_store_data?: boolean
          created_at?: string
          current_supports?: string | null
          date_of_birth?: string
          full_name?: string
          grade?: string
          id?: string
          languages_at_home?: string[] | null
          lead_status?: Database["public"]["Enums"]["lead_status"]
          parent_id?: string
          parent_observations?: string | null
          primary_concerns?: string[] | null
          school?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      subtests: {
        Row: {
          assessment_id: string
          created_at: string
          description: string | null
          id: string
          item_count: number | null
          name: string
          order_index: number
          script_prompt: string | null
          stimulus_url: string | null
          updated_at: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          description?: string | null
          id?: string
          item_count?: number | null
          name: string
          order_index?: number
          script_prompt?: string | null
          stimulus_url?: string | null
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          description?: string | null
          id?: string
          item_count?: number | null
          name?: string
          order_index?: number
          script_prompt?: string | null
          stimulus_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtests_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
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
      get_available_appointment_slots: {
        Args: { end_date: string; start_date: string }
        Returns: {
          is_booked: boolean
          scheduled_at: string
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
      app_role: "admin" | "assessor"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      lead_status:
        | "new"
        | "scheduled"
        | "completed"
        | "follow_up_needed"
        | "converted"
      response_code:
        | "correct"
        | "incorrect"
        | "self_correct"
        | "prompted"
        | "no_response"
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
      app_role: ["admin", "assessor"],
      appointment_status: [
        "scheduled",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      lead_status: [
        "new",
        "scheduled",
        "completed",
        "follow_up_needed",
        "converted",
      ],
      response_code: [
        "correct",
        "incorrect",
        "self_correct",
        "prompted",
        "no_response",
      ],
    },
  },
} as const
