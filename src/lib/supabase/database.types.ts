export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      professionals: {
        Row: {
          id: string
          clerk_user_id: string
          email: string
          name: string | null
          subscription_plan: 'trial' | 'solo' | 'practice' | 'professional'
          credits_balance: number
          credits_total_purchased: number
          max_patients: number | null
          max_storage_mb: number
          current_storage_mb: number
          trial_started_at: string | null
          trial_ends_at: string | null
          is_trial_active: boolean
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string
          subscription_current_period_start: string | null
          subscription_current_period_end: string | null
          custom_logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_user_id: string
          email: string
          name?: string | null
          subscription_plan?: 'trial' | 'solo' | 'practice' | 'professional'
          credits_balance?: number
          credits_total_purchased?: number
          max_patients?: number | null
          max_storage_mb?: number
          current_storage_mb?: number
          trial_started_at?: string | null
          trial_ends_at?: string | null
          is_trial_active?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          subscription_current_period_start?: string | null
          subscription_current_period_end?: string | null
          custom_logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_user_id?: string
          email?: string
          name?: string | null
          subscription_plan?: 'trial' | 'solo' | 'practice' | 'professional'
          credits_balance?: number
          credits_total_purchased?: number
          max_patients?: number | null
          max_storage_mb?: number
          current_storage_mb?: number
          trial_started_at?: string | null
          trial_ends_at?: string | null
          is_trial_active?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          subscription_current_period_start?: string | null
          subscription_current_period_end?: string | null
          custom_logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          professional_id: string
          name: string
          last_name: string
          birth_date: string | null
          alias: string | null
          phone: string
          email: string
          contact_preference: 'phone' | 'email' | null
          consent_data_processing: Json | null
          consent_reminders: Json | null
          legal_representative: Json | null
          reason_for_consultation: string
          current_risk: 'none' | 'low' | 'medium' | 'high' | null
          allergies: string | null
          assigned_professional: string | null
          registration_date: string
          referral_source: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          name: string
          last_name: string
          birth_date?: string | null
          alias?: string | null
          phone: string
          email: string
          contact_preference?: 'phone' | 'email' | null
          consent_data_processing?: Json | null
          consent_reminders?: Json | null
          legal_representative?: Json | null
          reason_for_consultation: string
          current_risk?: 'none' | 'low' | 'medium' | 'high' | null
          allergies?: string | null
          assigned_professional?: string | null
          registration_date?: string
          referral_source?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          name?: string
          last_name?: string
          birth_date?: string | null
          alias?: string | null
          phone?: string
          email?: string
          contact_preference?: 'phone' | 'email' | null
          consent_data_processing?: Json | null
          consent_reminders?: Json | null
          legal_representative?: Json | null
          reason_for_consultation?: string
          current_risk?: 'none' | 'low' | 'medium' | 'high' | null
          allergies?: string | null
          assigned_professional?: string | null
          registration_date?: string
          referral_source?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          patient_id: string
          professional_id: string
          session_date: string
          duration: number
          notes: string | null
          treatment_goals: string[] | null
          goal_status: 'not_started' | 'in_progress' | 'achieved' | null
          risk_screening: 'none' | 'low' | 'medium' | 'high' | null
          risk_actions: string | null
          diagnosis: Json | null
          applied_techniques: string[] | null
          reported_medication: string | null
          scales: Json[] | null
          consent_recording: Json | null
          attachments: string[] | null
          audio_url: string | null
          audio_duration_seconds: number | null
          audio_size_mb: number | null
          billing: Json | null
          transcription: string | null
          analysis: Json | null
          metrics: Json | null
          credits_consumed: number
          ai_processing_status: 'pending' | 'processing' | 'completed' | 'failed'
          ai_processed_at: string | null
          ai_error: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          professional_id: string
          session_date: string
          duration: number
          notes?: string | null
          treatment_goals?: string[] | null
          goal_status?: 'not_started' | 'in_progress' | 'achieved' | null
          risk_screening?: 'none' | 'low' | 'medium' | 'high' | null
          risk_actions?: string | null
          diagnosis?: Json | null
          applied_techniques?: string[] | null
          reported_medication?: string | null
          scales?: Json[] | null
          consent_recording?: Json | null
          attachments?: string[] | null
          audio_url?: string | null
          audio_duration_seconds?: number | null
          audio_size_mb?: number | null
          billing?: Json | null
          transcription?: string | null
          analysis?: Json | null
          metrics?: Json | null
          credits_consumed?: number
          ai_processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          ai_processed_at?: string | null
          ai_error?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          professional_id?: string
          session_date?: string
          duration?: number
          notes?: string | null
          treatment_goals?: string[] | null
          goal_status?: 'not_started' | 'in_progress' | 'achieved' | null
          risk_screening?: 'none' | 'low' | 'medium' | 'high' | null
          risk_actions?: string | null
          diagnosis?: Json | null
          applied_techniques?: string[] | null
          reported_medication?: string | null
          scales?: Json[] | null
          consent_recording?: Json | null
          attachments?: string[] | null
          audio_url?: string | null
          audio_duration_seconds?: number | null
          audio_size_mb?: number | null
          billing?: Json | null
          transcription?: string | null
          analysis?: Json | null
          metrics?: Json | null
          credits_consumed?: number
          ai_processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          ai_processed_at?: string | null
          ai_error?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          professional_id: string
          amount: number
          balance_after: number
          transaction_type: 'subscription_renewal' | 'credit_pack_purchase' | 'session_analysis' | 'refund' | 'adjustment'
          session_id: string | null
          stripe_payment_intent_id: string | null
          description: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          amount: number
          balance_after: number
          transaction_type: 'subscription_renewal' | 'credit_pack_purchase' | 'session_analysis' | 'refund' | 'adjustment'
          session_id?: string | null
          stripe_payment_intent_id?: string | null
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          amount?: number
          balance_after?: number
          transaction_type?: 'subscription_renewal' | 'credit_pack_purchase' | 'session_analysis' | 'refund' | 'adjustment'
          session_id?: string | null
          stripe_payment_intent_id?: string | null
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      subscription_history: {
        Row: {
          id: string
          professional_id: string
          from_plan: string | null
          to_plan: string
          credits_added: number
          stripe_invoice_id: string | null
          amount_paid: number | null
          effective_date: string
          created_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          from_plan?: string | null
          to_plan: string
          credits_added?: number
          stripe_invoice_id?: string | null
          amount_paid?: number | null
          effective_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          from_plan?: string | null
          to_plan?: string
          credits_added?: number
          stripe_invoice_id?: string | null
          amount_paid?: number | null
          effective_date?: string
          created_at?: string
        }
      }
    }
    Functions: {
      calculate_credits_for_audio: {
        Args: { duration_minutes: number }
        Returns: number
      }
      has_enough_credits: {
        Args: { prof_id: string; required_credits: number }
        Returns: boolean
      }
      consume_credits: {
        Args: {
          prof_id: string
          amount: number
          session_id: string
          description: string
        }
        Returns: boolean
      }
      add_credits: {
        Args: {
          prof_id: string
          amount: number
          transaction_type: string
          description: string
          stripe_payment_intent_id?: string
        }
        Returns: number
      }
      check_plan_limits: {
        Args: { prof_id: string }
        Returns: {
          can_create_patient: boolean
          can_upload_audio: boolean
          patients_count: number
          patients_limit: number | null
          storage_used_mb: number
          storage_limit_mb: number
          credits_remaining: number
        }[]
      }
    }
  }
}
