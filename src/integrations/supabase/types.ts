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
      agenda_events: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          location: string | null
          reminder_offset_hours: number
          reminder_sent_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          location?: string | null
          reminder_offset_hours?: number
          reminder_sent_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          location?: string | null
          reminder_offset_hours?: number
          reminder_sent_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ambassador_contract_acceptances: {
        Row: {
          accepted_at: string
          contract_text_hash: string | null
          contract_version: string
          created_at: string
          full_name: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          contract_text_hash?: string | null
          contract_version: string
          created_at?: string
          full_name: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          contract_text_hash?: string | null
          contract_version?: string
          created_at?: string
          full_name?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ambassador_payouts: {
        Row: {
          ambassador_user_id: string
          amount_cents: number
          created_at: string
          failure_reason: string | null
          holder_name: string | null
          iban_last4: string | null
          id: string
          paid_at: string | null
          referral_count: number
          scheduled_for: string | null
          sepa_batch_id: string | null
          sepa_xml_path: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ambassador_user_id: string
          amount_cents: number
          created_at?: string
          failure_reason?: string | null
          holder_name?: string | null
          iban_last4?: string | null
          id?: string
          paid_at?: string | null
          referral_count?: number
          scheduled_for?: string | null
          sepa_batch_id?: string | null
          sepa_xml_path?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ambassador_user_id?: string
          amount_cents?: number
          created_at?: string
          failure_reason?: string | null
          holder_name?: string | null
          iban_last4?: string | null
          id?: string
          paid_at?: string | null
          referral_count?: number
          scheduled_for?: string | null
          sepa_batch_id?: string | null
          sepa_xml_path?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ambassador_profiles: {
        Row: {
          created_at: string
          current_tier: string
          iban_encrypted: string | null
          iban_holder_name: string | null
          joined_at: string
          referral_code: string
          updated_at: string
          user_id: string
          validated_referrals_count: number
        }
        Insert: {
          created_at?: string
          current_tier?: string
          iban_encrypted?: string | null
          iban_holder_name?: string | null
          joined_at?: string
          referral_code: string
          updated_at?: string
          user_id: string
          validated_referrals_count?: number
        }
        Update: {
          created_at?: string
          current_tier?: string
          iban_encrypted?: string | null
          iban_holder_name?: string | null
          joined_at?: string
          referral_code?: string
          updated_at?: string
          user_id?: string
          validated_referrals_count?: number
        }
        Relationships: []
      }
      ambassador_referrals: {
        Row: {
          ambassador_user_id: string
          amount_paid_cents: number
          commission_cents: number
          commission_rate: number
          created_at: string
          id: string
          paid_at: string | null
          payment_id: string
          payout_id: string | null
          referral_code_used: string
          referred_user_id: string | null
          status: string
          updated_at: string
          validated_at: string | null
        }
        Insert: {
          ambassador_user_id: string
          amount_paid_cents: number
          commission_cents: number
          commission_rate: number
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_id: string
          payout_id?: string | null
          referral_code_used: string
          referred_user_id?: string | null
          status?: string
          updated_at?: string
          validated_at?: string | null
        }
        Update: {
          ambassador_user_id?: string
          amount_paid_cents?: number
          commission_cents?: number
          commission_rate?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_id?: string
          payout_id?: string | null
          referral_code_used?: string
          referred_user_id?: string | null
          status?: string
          updated_at?: string
          validated_at?: string | null
        }
        Relationships: []
      }
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
      autonomy_supports: {
        Row: {
          archived: boolean
          content: Json
          created_at: string
          description: string | null
          id: string
          is_favorite: boolean
          last_used_at: string | null
          personalisation: Json
          profile_id: string | null
          support_type: string
          tags: string[]
          title: string
          updated_at: string
          use_count: number
          user_id: string
        }
        Insert: {
          archived?: boolean
          content?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean
          last_used_at?: string | null
          personalisation?: Json
          profile_id?: string | null
          support_type: string
          tags?: string[]
          title: string
          updated_at?: string
          use_count?: number
          user_id: string
        }
        Update: {
          archived?: boolean
          content?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean
          last_used_at?: string | null
          personalisation?: Json
          profile_id?: string | null
          support_type?: string
          tags?: string[]
          title?: string
          updated_at?: string
          use_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "autonomy_supports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "family_medical_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          amount_cents: number
          created_at: string
          due_date: string
          id: string
          is_paid: boolean
          label: string
          notes: string | null
          paid_at: string | null
          reminder_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          due_date: string
          id?: string
          is_paid?: boolean
          label: string
          notes?: string | null
          paid_at?: string | null
          reminder_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          due_date?: string
          id?: string
          is_paid?: boolean
          label?: string
          notes?: string | null
          paid_at?: string | null
          reminder_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budget_entries: {
        Row: {
          amount_cents: number
          category: string
          created_at: string
          id: string
          kind: string
          label: string
          month: string | null
          recurring: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          category: string
          created_at?: string
          id?: string
          kind: string
          label: string
          month?: string | null
          recurring?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          category?: string
          created_at?: string
          id?: string
          kind?: string
          label?: string
          month?: string | null
          recurring?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      child_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          profile_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          profile_id: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          profile_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_contacts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "family_medical_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      child_emotion_entries: {
        Row: {
          age_band: string
          body_location: string | null
          created_at: string
          emotion: string
          id: string
          intensity: number | null
          is_crisis: boolean
          needs_parent: boolean
          note: string | null
          observed_signs: string[] | null
          user_id: string
        }
        Insert: {
          age_band: string
          body_location?: string | null
          created_at?: string
          emotion: string
          id?: string
          intensity?: number | null
          is_crisis?: boolean
          needs_parent?: boolean
          note?: string | null
          observed_signs?: string[] | null
          user_id: string
        }
        Update: {
          age_band?: string
          body_location?: string | null
          created_at?: string
          emotion?: string
          id?: string
          intensity?: number | null
          is_crisis?: boolean
          needs_parent?: boolean
          note?: string | null
          observed_signs?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          display_name: string
          joined_at: string
          user_id: string
        }
        Insert: {
          display_name: string
          joined_at?: string
          user_id: string
        }
        Update: {
          display_name?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          kind: string
          parent_id: string | null
          status: string
          thread_id: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          kind?: string
          parent_id?: string | null
          status?: string
          thread_id?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          kind?: string
          parent_id?: string | null
          status?: string
          thread_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "community_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reports: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reason: string
          reporter_id: string
          resolved: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reason?: string
          reporter_id: string
          resolved?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reason?: string
          reporter_id?: string
          resolved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "community_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_threads: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          slug: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          slug: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          slug?: string
          title?: string
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
      evolution_timelines: {
        Row: {
          before_text: string
          created_at: string
          id: string
          storm_text: string
          today_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          before_text?: string
          created_at?: string
          id?: string
          storm_text?: string
          today_text?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          before_text?: string
          created_at?: string
          id?: string
          storm_text?: string
          today_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      family_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          inviter_user_id: string
          personal_note: string | null
          role: string
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          inviter_user_id: string
          personal_note?: string | null
          role: string
          status?: string
          token: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          inviter_user_id?: string
          personal_note?: string | null
          role?: string
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      family_medical_documents: {
        Row: {
          category: string
          created_at: string
          doc_type: string
          doctor_name: string | null
          expiry_date: string | null
          file_name: string
          id: string
          is_favorite: boolean
          issued_date: string | null
          mime_type: string
          notes: string | null
          profile_id: string
          size_bytes: number
          storage_path: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          doc_type?: string
          doctor_name?: string | null
          expiry_date?: string | null
          file_name: string
          id?: string
          is_favorite?: boolean
          issued_date?: string | null
          mime_type?: string
          notes?: string | null
          profile_id: string
          size_bytes?: number
          storage_path: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          doc_type?: string
          doctor_name?: string | null
          expiry_date?: string | null
          file_name?: string
          id?: string
          is_favorite?: boolean
          issued_date?: string | null
          mime_type?: string
          notes?: string | null
          profile_id?: string
          size_bytes?: number
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_medical_documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "family_medical_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_medical_events: {
        Row: {
          created_at: string
          description: string | null
          document_id: string | null
          event_date: string
          event_type: string
          id: string
          location: string | null
          practitioner: string | null
          profile_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_id?: string | null
          event_date: string
          event_type?: string
          id?: string
          location?: string | null
          practitioner?: string | null
          profile_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_id?: string | null
          event_date?: string
          event_type?: string
          id?: string
          location?: string | null
          practitioner?: string | null
          profile_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_medical_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "family_medical_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_medical_profiles: {
        Row: {
          allergies: string
          avatar_url: string | null
          birth_date: string | null
          blood_type: string
          created_at: string
          current_treatments: string
          diagnoses: string
          diagnosis_tags: string[]
          doctor_name: string
          doctor_phone: string
          emergency_contact_name: string
          emergency_contact_phone: string
          first_name: string
          id: string
          interests: string[]
          medical_history: string
          notes: string
          preferences: string
          relation: string
          sensitivities: string[]
          soothers: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string
          avatar_url?: string | null
          birth_date?: string | null
          blood_type?: string
          created_at?: string
          current_treatments?: string
          diagnoses?: string
          diagnosis_tags?: string[]
          doctor_name?: string
          doctor_phone?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          first_name?: string
          id?: string
          interests?: string[]
          medical_history?: string
          notes?: string
          preferences?: string
          relation?: string
          sensitivities?: string[]
          soothers?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string
          avatar_url?: string | null
          birth_date?: string | null
          blood_type?: string
          created_at?: string
          current_treatments?: string
          diagnoses?: string
          diagnosis_tags?: string[]
          doctor_name?: string
          doctor_phone?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          first_name?: string
          id?: string
          interests?: string[]
          medical_history?: string
          notes?: string
          preferences?: string
          relation?: string
          sensitivities?: string[]
          soothers?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      family_vaccinations: {
        Row: {
          created_at: string
          date_given: string | null
          id: string
          next_due_date: string | null
          notes: string | null
          profile_id: string
          updated_at: string
          user_id: string
          vaccine_name: string
        }
        Insert: {
          created_at?: string
          date_given?: string | null
          id?: string
          next_due_date?: string | null
          notes?: string | null
          profile_id: string
          updated_at?: string
          user_id: string
          vaccine_name: string
        }
        Update: {
          created_at?: string
          date_given?: string | null
          id?: string
          next_due_date?: string | null
          notes?: string | null
          profile_id?: string
          updated_at?: string
          user_id?: string
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_vaccinations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "family_medical_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      founding_families: {
        Row: {
          created_at: string
          id: string
          joined_at: string
          payment_id: string | null
          position: number
          price_cents: number
          tier_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string
          payment_id?: string | null
          position: number
          price_cents: number
          tier_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string
          payment_id?: string | null
          position?: number
          price_cents?: number
          tier_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lsf_progress: {
        Row: {
          id: string
          learned_at: string
          sign_key: string
          user_id: string
        }
        Insert: {
          id?: string
          learned_at?: string
          sign_key: string
          user_id: string
        }
        Update: {
          id?: string
          learned_at?: string
          sign_key?: string
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
      organisation_notes: {
        Row: {
          color: string | null
          content: string
          created_at: string
          id: string
          pinned: boolean
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          content?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          content?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pending_account_emails: {
        Row: {
          attempts: number
          created_at: string
          email: string
          id: string
          last_attempt_at: string | null
          last_error: string | null
          max_attempts: number
          next_attempt_at: string
          payment_id: string
          sent_at: string | null
          status: string
          template_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          email: string
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          max_attempts?: number
          next_attempt_at?: string
          payment_id: string
          sent_at?: string | null
          status?: string
          template_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          email?: string
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          max_attempts?: number
          next_attempt_at?: string
          payment_id?: string
          sent_at?: string | null
          status?: string
          template_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      personal_goals: {
        Row: {
          achieved_at: string | null
          created_at: string
          done: boolean
          id: string
          kind: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string
          done?: boolean
          id?: string
          kind?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          created_at?: string
          done?: boolean
          id?: string
          kind?: string
          title?: string
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
      private_journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          mode: string
          prompt_key: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          mode?: string
          prompt_key?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mode?: string
          prompt_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_custom: string | null
          address_style: string | null
          caregiver_role: string | null
          challenges: string[]
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
          onboarding_completed_at: string | null
          parent_type: string | null
          parent_type_synced_at: string | null
          plan_type: string
          preferred_style: string | null
          preferred_style_synced_at: string | null
          reminders_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          address_custom?: string | null
          address_style?: string | null
          caregiver_role?: string | null
          challenges?: string[]
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
          onboarding_completed_at?: string | null
          parent_type?: string | null
          parent_type_synced_at?: string | null
          plan_type?: string
          preferred_style?: string | null
          preferred_style_synced_at?: string | null
          reminders_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          address_custom?: string | null
          address_style?: string | null
          caregiver_role?: string | null
          challenges?: string[]
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
          onboarding_completed_at?: string | null
          parent_type?: string | null
          parent_type_synced_at?: string | null
          plan_type?: string
          preferred_style?: string | null
          preferred_style_synced_at?: string | null
          reminders_enabled?: boolean
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
      quiz_events: {
        Row: {
          created_at: string
          event_type: string
          first_name: string | null
          id: string
          max_score: number | null
          metadata: Json | null
          score: number | null
          session_id: string | null
          user_id: string | null
          verdict_badge: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          first_name?: string | null
          id?: string
          max_score?: number | null
          metadata?: Json | null
          score?: number | null
          session_id?: string | null
          user_id?: string | null
          verdict_badge?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          first_name?: string | null
          id?: string
          max_score?: number | null
          metadata?: Json | null
          score?: number | null
          session_id?: string | null
          user_id?: string | null
          verdict_badge?: string | null
        }
        Relationships: []
      }
      shopping_items: {
        Row: {
          category: string | null
          checked: boolean
          created_at: string
          id: string
          list_name: string | null
          name: string
          quantity: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          checked?: boolean
          created_at?: string
          id?: string
          list_name?: string | null
          name: string
          quantity?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          checked?: boolean
          created_at?: string
          id?: string
          list_name?: string | null
          name?: string
          quantity?: string | null
          updated_at?: string
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
      todo_items: {
        Row: {
          category: string | null
          created_at: string
          done: boolean
          due_date: string | null
          id: string
          priority: string | null
          reminder_offset_hours: number
          reminder_sent_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          priority?: string | null
          reminder_offset_hours?: number
          reminder_sent_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          priority?: string | null
          reminder_offset_hours?: number
          reminder_sent_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transformation_portraits: {
        Row: {
          becoming: string
          created_at: string
          developing: string
          entry_count: number
          generation_mode: string
          id: string
          month: number
          new_strengths: string
          overcome: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          becoming: string
          created_at?: string
          developing: string
          entry_count?: number
          generation_mode?: string
          id?: string
          month: number
          new_strengths: string
          overcome: string
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          becoming?: string
          created_at?: string
          developing?: string
          entry_count?: number
          generation_mode?: string
          id?: string
          month?: number
          new_strengths?: string
          overcome?: string
          updated_at?: string
          user_id?: string
          year?: number
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
      vault_documents: {
        Row: {
          amount_cents: number | null
          category: string
          created_at: string
          expiry_date: string | null
          id: string
          is_favorite: boolean
          mime_type: string | null
          name: string
          notes: string | null
          size_bytes: number | null
          storage_path: string
          tags: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          category?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_favorite?: boolean
          mime_type?: string | null
          name: string
          notes?: string | null
          size_bytes?: number | null
          storage_path: string
          tags?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          category?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_favorite?: boolean
          mime_type?: string | null
          name?: string
          notes?: string | null
          size_bytes?: number | null
          storage_path?: string
          tags?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vault_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      vault_secure_notes: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_favorite: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          title?: string
          updated_at?: string
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
      _trigger_monthly_portraits: { Args: never; Returns: undefined }
      accept_ambassador_contract: {
        Args: {
          _contract_hash?: string
          _contract_version: string
          _full_name: string
          _user_agent?: string
        }
        Returns: Json
      }
      accept_family_invitation: { Args: { _token: string }; Returns: Json }
      award_badges: { Args: { _badge_keys: string[] }; Returns: undefined }
      claim_founding_slot: {
        Args: { _paid_cents: number; _payment_id: string; _user_id: string }
        Returns: Json
      }
      cleanup_pending_account_emails: { Args: never; Returns: Json }
      create_family_invitation: {
        Args: { _email: string; _note?: string; _role: string }
        Returns: Json
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      ensure_ambassador_profile: { Args: { _user_id: string }; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      get_batch_recipients_admin: { Args: { _batch_id: string }; Returns: Json }
      get_emergency_usage: { Args: never; Returns: Json }
      get_family_invitation_by_token: {
        Args: { _token: string }
        Returns: Json
      }
      get_founding_offer: { Args: never; Returns: Json }
      get_is_premium: { Args: { _user_id: string }; Returns: boolean }
      get_medical_record_by_token: { Args: { _token: string }; Returns: Json }
      get_my_ambassador_impact: { Args: never; Returns: Json }
      get_my_contract_status: { Args: never; Returns: Json }
      get_my_founding_status: { Args: never; Returns: Json }
      get_payout_batch_admin: { Args: { _batch_id: string }; Returns: Json }
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
      is_community_member: { Args: { _user_id: string }; Returns: boolean }
      list_payout_batches_admin: { Args: never; Returns: Json }
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
      mark_payout_batch_paid_admin: {
        Args: { _batch_id: string }
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
      revoke_family_invitation: { Args: { _id: string }; Returns: Json }
      set_my_iban: {
        Args: { _holder_name: string; _iban: string }
        Returns: Json
      }
      upsert_user_progress: {
        Args: { _completed_phases: number[] }
        Returns: undefined
      }
      use_emergency: { Args: never; Returns: Json }
      validate_pending_referrals: {
        Args: { _older_than_days?: number }
        Returns: Json
      }
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
