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
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_at: string
          created_at: string
          id: string
          location: string | null
          notes: string | null
          reminder_1h_sent: boolean
          reminder_24h_sent: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_at: string
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          reminder_1h_sent?: boolean
          reminder_24h_sent?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_at?: string
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          reminder_1h_sent?: boolean
          reminder_24h_sent?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      emergency_uses: {
        Row: {
          id: string
          used_at: string
          used_date: string
          user_id: string
        }
        Insert: {
          id?: string
          used_at?: string
          used_date?: string
          user_id: string
        }
        Update: {
          id?: string
          used_at?: string
          used_date?: string
          user_id?: string
        }
        Relationships: []
      }
      emotion_checkins: {
        Row: {
          created_at: string
          emotion: string
          emotion_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emotion: string
          emotion_type?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emotion?: string
          emotion_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          allergies: string | null
          birth_date: string | null
          blood_type: string | null
          created_at: string
          current_treatments: string | null
          doctor_name: string | null
          doctor_phone: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string | null
          id: string
          is_public: boolean
          last_name: string | null
          last_token_regen_at: string | null
          medical_history: string | null
          public_token: string
          social_security_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string | null
          birth_date?: string | null
          blood_type?: string | null
          created_at?: string
          current_treatments?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string | null
          id?: string
          is_public?: boolean
          last_name?: string | null
          last_token_regen_at?: string | null
          medical_history?: string | null
          public_token?: string
          social_security_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string | null
          birth_date?: string | null
          blood_type?: string | null
          created_at?: string
          current_treatments?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string | null
          id?: string
          is_public?: boolean
          last_name?: string | null
          last_token_regen_at?: string | null
          medical_history?: string | null
          public_token?: string
          social_security_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medication_reminder_log: {
        Row: {
          id: string
          medication_id: string
          reminder_date: string
          reminder_time: string
          sent_at: string
          user_id: string
        }
        Insert: {
          id?: string
          medication_id: string
          reminder_date: string
          reminder_time: string
          sent_at?: string
          user_id: string
        }
        Update: {
          id?: string
          medication_id?: string
          reminder_date?: string
          reminder_time?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          active: boolean
          created_at: string
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          name: string
          notes: string | null
          schedule_times: string[]
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          name: string
          notes?: string | null
          schedule_times?: string[]
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          name?: string
          notes?: string | null
          schedule_times?: string[]
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_responses: {
        Row: {
          adjust: number
          created_at: string
          id: string
          mood: string
          response_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          adjust?: number
          created_at?: string
          id?: string
          mood: string
          response_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          adjust?: number
          created_at?: string
          id?: string
          mood?: string
          response_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      premium_activation_log: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          message: string | null
          payment_id: string | null
          raw: Json | null
          source: string
          status: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          message?: string | null
          payment_id?: string | null
          raw?: Json | null
          source?: string
          status: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          message?: string | null
          payment_id?: string | null
          raw?: Json | null
          source?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          current_streak: number
          email: string | null
          first_name: string
          has_initiation_access: boolean
          id: string
          is_premium: boolean
          last_checkin_date: string | null
          last_emotion: string | null
          longest_streak: number
          plan_type: string
          preferred_style: string | null
          preferred_style_synced_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          email?: string | null
          first_name?: string
          has_initiation_access?: boolean
          id?: string
          is_premium?: boolean
          last_checkin_date?: string | null
          last_emotion?: string | null
          longest_streak?: number
          plan_type?: string
          preferred_style?: string | null
          preferred_style_synced_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          email?: string | null
          first_name?: string
          has_initiation_access?: boolean
          id?: string
          is_premium?: boolean
          last_checkin_date?: string | null
          last_emotion?: string | null
          longest_streak?: number
          plan_type?: string
          preferred_style?: string | null
          preferred_style_synced_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      speech_progress: {
        Row: {
          created_at: string
          elapsed: number
          id: string
          lang: string | null
          sentence: number
          text_key: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          elapsed?: number
          id?: string
          lang?: string | null
          sentence?: number
          text_key: string
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          elapsed?: number
          id?: string
          lang?: string | null
          sentence?: number
          text_key?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          id: string
          mollie_customer_id: string
          mollie_subscription_id: string | null
          plan: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          mollie_customer_id: string
          mollie_subscription_id?: string | null
          plan?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          mollie_customer_id?: string
          mollie_subscription_id?: string | null
          plan?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_logs: {
        Row: {
          attempts: number | null
          created_at: string
          error_code: string | null
          error_message: string | null
          id: string
          last_state: string | null
          metadata: Json | null
          source: string
          ticket_id: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          last_state?: string | null
          metadata?: Json | null
          source?: string
          ticket_id: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          last_state?: string | null
          metadata?: Json | null
          source?: string
          ticket_id?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_key: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_key: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_key?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_phases: number[]
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_phases?: number[]
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_phases?: number[]
          id?: string
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
      webhook_alert_state: {
        Row: {
          id: string
          last_alert_at: string
          last_failure_count: number
          updated_at: string
        }
        Insert: {
          id: string
          last_alert_at?: string
          last_failure_count?: number
          updated_at?: string
        }
        Update: {
          id?: string
          last_alert_at?: string
          last_failure_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      webhook_anomalies: {
        Row: {
          created_at: string
          first_seen_at: string
          id: string
          kind: string
          last_seen_at: string
          message: string | null
          occurrences: number
          payment_id: string | null
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          snapshot: Json | null
          status: string
          target_user_id: string | null
          ticket_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_seen_at?: string
          id?: string
          kind: string
          last_seen_at?: string
          message?: string | null
          occurrences?: number
          payment_id?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          snapshot?: Json | null
          status?: string
          target_user_id?: string | null
          ticket_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_seen_at?: string
          id?: string
          kind?: string
          last_seen_at?: string
          message?: string | null
          occurrences?: number
          payment_id?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          snapshot?: Json | null
          status?: string
          target_user_id?: string | null
          ticket_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_badges: { Args: { _badge_keys: string[] }; Returns: undefined }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_emergency_usage: { Args: never; Returns: Json }
      get_is_premium: { Args: { _user_id: string }; Returns: boolean }
      get_medical_record_by_token: { Args: { _token: string }; Returns: Json }
      get_premium_activation_log: {
        Args: {
          _from?: string
          _limit?: number
          _offset?: number
          _payment_id?: string
          _status?: string
          _to?: string
        }
        Returns: {
          amount: number
          created_at: string
          id: string
          message: string
          payment_id: string
          source: string
          status: string
          total_count: number
          user_id: string
        }[]
      }
      get_premium_audit: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_audit_anomaly: {
        Args: {
          _kind: string
          _payload: Json
          _payment_id: string
          _target_user_id: string
          _window_minutes?: number
        }
        Returns: Json
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      regenerate_medical_token: { Args: never; Returns: Json }
      resolve_webhook_anomaly: {
        Args: { _anomaly_id: string; _new_status: string; _note?: string }
        Returns: Json
      }
      upsert_user_progress: {
        Args: { _completed_phases: number[] }
        Returns: undefined
      }
      use_emergency: { Args: never; Returns: Json }
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
    },
  },
} as const
