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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      daily_usage: {
        Row: {
          created_at: string | null
          id: number
          test_count: number | null
          usage_date: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          test_count?: number | null
          usage_date?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          test_count?: number | null
          usage_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      environments: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          status: string | null
          type: string | null
          updated_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "environments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_usage: {
        Row: {
          created_at: string | null
          guest_id: string
          id: number
          ip_address: string | null
          test_count: number | null
        }
        Insert: {
          created_at?: string | null
          guest_id: string
          id?: number
          ip_address?: string | null
          test_count?: number | null
        }
        Update: {
          created_at?: string | null
          guest_id?: string
          id?: number
          ip_address?: string | null
          test_count?: number | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          data: Json | null
          failed_tests: number | null
          id: number
          pass_rate: number | null
          passed_tests: number | null
          period_end: string | null
          period_start: string | null
          title: string
          total_tests: number | null
          user_id: string | null
          warning_tests: number | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          failed_tests?: number | null
          id?: number
          pass_rate?: number | null
          passed_tests?: number | null
          period_end?: string | null
          period_start?: string | null
          title: string
          total_tests?: number | null
          user_id?: string | null
          warning_tests?: number | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          failed_tests?: number | null
          id?: number
          pass_rate?: number | null
          passed_tests?: number | null
          period_end?: string | null
          period_start?: string | null
          title?: string
          total_tests?: number | null
          user_id?: string | null
          warning_tests?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string | null
          cron_expression: string
          enabled: boolean | null
          id: number
          last_run: string | null
          last_status: string | null
          name: string
          next_run: string | null
          suite_id: number | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          cron_expression: string
          enabled?: boolean | null
          id?: number
          last_run?: string | null
          last_status?: string | null
          name: string
          next_run?: string | null
          suite_id?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          cron_expression?: string
          enabled?: boolean | null
          id?: number
          last_run?: string | null
          last_status?: string | null
          name?: string
          next_run?: string | null
          suite_id?: number | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_suite_id_fkey"
            columns: ["suite_id"]
            isOneToOne: false
            referencedRelation: "test_suites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      test_artifacts: {
        Row: {
          artifact_type: string
          created_at: string | null
          file_path: string
          file_size: number | null
          file_url: string | null
          id: number
          mime_type: string | null
          result_id: number | null
          run_id: number | null
        }
        Insert: {
          artifact_type: string
          created_at?: string | null
          file_path: string
          file_size?: number | null
          file_url?: string | null
          id?: number
          mime_type?: string | null
          result_id?: number | null
          run_id?: number | null
        }
        Update: {
          artifact_type?: string
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          file_url?: string | null
          id?: number
          mime_type?: string | null
          result_id?: number | null
          run_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "test_artifacts_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "test_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_artifacts_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "test_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      test_cases: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          id: number
          name: string
          status: string | null
          suite_id: number | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          status?: string | null
          suite_id?: number | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          status?: string | null
          suite_id?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_cases_suite_id_fkey"
            columns: ["suite_id"]
            isOneToOne: false
            referencedRelation: "test_suites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_cases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          actual_behavior: string | null
          created_at: string | null
          details: Json | null
          duration_ms: number | null
          error_category: string | null
          error_message: string | null
          expected_behavior: string | null
          id: number
          run_id: number | null
          status: string
          test_name: string
          test_type: string
          url: string | null
        }
        Insert: {
          actual_behavior?: string | null
          created_at?: string | null
          details?: Json | null
          duration_ms?: number | null
          error_category?: string | null
          error_message?: string | null
          expected_behavior?: string | null
          id?: number
          run_id?: number | null
          status: string
          test_name: string
          test_type: string
          url?: string | null
        }
        Update: {
          actual_behavior?: string | null
          created_at?: string | null
          details?: Json | null
          duration_ms?: number | null
          error_category?: string | null
          error_message?: string | null
          expected_behavior?: string | null
          id?: number
          run_id?: number | null
          status?: string
          test_name?: string
          test_type?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_results_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "test_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      test_runs: {
        Row: {
          browser: string | null
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          failed_tests: number | null
          guest_id: string | null
          id: number
          overall_status: string | null
          passed_tests: number | null
          started_at: string | null
          status: string | null
          test_config: Json | null
          test_mode: string | null
          total_tests: number | null
          url: string
          user_id: string | null
          warning_tests: number | null
        }
        Insert: {
          browser?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          failed_tests?: number | null
          guest_id?: string | null
          id?: number
          overall_status?: string | null
          passed_tests?: number | null
          started_at?: string | null
          status?: string | null
          test_config?: Json | null
          test_mode?: string | null
          total_tests?: number | null
          url: string
          user_id?: string | null
          warning_tests?: number | null
        }
        Update: {
          browser?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          failed_tests?: number | null
          guest_id?: string | null
          id?: number
          overall_status?: string | null
          passed_tests?: number | null
          started_at?: string | null
          status?: string | null
          test_config?: Json | null
          test_mode?: string | null
          total_tests?: number | null
          url?: string
          user_id?: string | null
          warning_tests?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "test_runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      test_suites: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          test_count: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          test_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          test_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_suites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          plan: string | null
          supabase_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id?: string
          plan?: string | null
          supabase_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          plan?: string | null
          supabase_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
