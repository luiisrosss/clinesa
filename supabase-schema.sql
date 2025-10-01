-- =====================================================
-- CLINESA - Database Schema for Supabase
-- =====================================================
-- Este archivo contiene el schema completo de la base de datos
-- Ejecuta este script en el SQL Editor de Supabase
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TABLA: professionals
-- =====================================================
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,

  -- Plan y créditos
  subscription_plan TEXT DEFAULT 'trial' CHECK (subscription_plan IN ('trial', 'solo', 'practice', 'professional')),
  credits_balance INTEGER DEFAULT 100,
  credits_total_purchased INTEGER DEFAULT 0,

  -- Límites del plan
  max_patients INTEGER DEFAULT 3, -- 3 para trial, 10 para solo, null para ilimitado
  max_storage_mb INTEGER DEFAULT 50, -- 50 MB trial
  current_storage_mb NUMERIC(10,2) DEFAULT 0,

  -- Trial
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  is_trial_active BOOLEAN DEFAULT true,

  -- Suscripción
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'paused')),
  subscription_current_period_start TIMESTAMPTZ,
  subscription_current_period_end TIMESTAMPTZ,

  -- Branding (Professional)
  custom_logo_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at
CREATE TRIGGER update_professionals_updated_at
  BEFORE UPDATE ON professionals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON professionals FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile"
  ON professionals FOR UPDATE
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- =====================================================
-- TABLA: patients
-- =====================================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,

  -- Identificación Básica
  name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  alias TEXT,

  -- Contacto
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_preference TEXT CHECK (contact_preference IN ('phone', 'email')),

  -- RGPD/Consentimientos
  consent_data_processing JSONB,
  consent_reminders JSONB,
  legal_representative JSONB,

  -- Clínico
  reason_for_consultation TEXT NOT NULL,
  current_risk TEXT CHECK (current_risk IN ('none', 'low', 'medium', 'high')),
  allergies TEXT,

  -- Administrativo
  assigned_professional TEXT,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  referral_source TEXT,

  -- Estado
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX idx_patients_professional ON patients(professional_id);
CREATE INDEX idx_patients_active ON patients(professional_id, is_active) WHERE is_active = true;

-- RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view own patients"
  ON patients FOR SELECT
  USING (professional_id IN (
    SELECT id FROM professionals WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Professionals can insert own patients"
  ON patients FOR INSERT
  WITH CHECK (professional_id IN (
    SELECT id FROM professionals WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Professionals can update own patients"
  ON patients FOR UPDATE
  USING (professional_id IN (
    SELECT id FROM professionals WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Professionals can delete own patients"
  ON patients FOR DELETE
  USING (professional_id IN (
    SELECT id FROM professionals WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- =====================================================
-- TABLA: sessions
-- =====================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,

  -- Datos básicos
  session_date TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL, -- minutos
  notes TEXT,

  -- Tratamiento
  treatment_goals TEXT[],
  goal_status TEXT CHECK (goal_status IN ('not_started', 'in_progress', 'achieved')),

  -- Evaluación de riesgo
  risk_screening TEXT CHECK (risk_screening IN ('none', 'low', 'medium', 'high')),
  risk_actions TEXT,

  -- Diagnóstico
  diagnosis JSONB,

  -- Técnicas y medicación
  applied_techniques TEXT[],
  reported_medication TEXT,

  -- Escalas
  scales JSONB[],

  -- Consentimiento
  consent_recording JSONB,

  -- Archivos
  attachments TEXT[],
  audio_url TEXT,
  audio_storage_path TEXT, -- Path en Supabase Storage
  audio_duration_seconds INTEGER,
  audio_size_mb NUMERIC(10,2),

  -- Facturación
  billing JSONB,

  -- IA y Créditos
  transcription TEXT,
  analysis JSONB,
  metrics JSONB,
  credits_consumed INTEGER DEFAULT 0,
  ai_processing_status TEXT DEFAULT 'pending' CHECK (ai_processing_status IN ('pending', 'processing', 'completed', 'failed')),
  ai_processed_at TIMESTAMPTZ,
  ai_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX idx_sessions_patient ON sessions(patient_id);
CREATE INDEX idx_sessions_professional ON sessions(professional_id);
CREATE INDEX idx_sessions_date ON sessions(session_date DESC);
CREATE INDEX idx_sessions_ai_status ON sessions(professional_id, ai_processing_status);

-- RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view own sessions"
  ON sessions FOR SELECT
  USING (professional_id IN (
    SELECT id FROM professionals WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Professionals can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (professional_id IN (
    SELECT id FROM professionals WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Professionals can update own sessions"
  ON sessions FOR UPDATE
  USING (professional_id IN (
    SELECT id FROM professionals WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Professionals can delete own sessions"
  ON sessions FOR DELETE
  USING (professional_id IN (
    SELECT id FROM professionals WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- =====================================================
-- TABLA: credit_transactions
-- =====================================================
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,

  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription_renewal', 'credit_pack_purchase', 'session_analysis', 'refund', 'adjustment')),

  -- Relaciones
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT,

  description TEXT,
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_credit_transactions_professional ON credit_transactions(professional_id, created_at DESC);
CREATE INDEX idx_credit_transactions_session ON credit_transactions(session_id);

-- RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view own transactions"
  ON credit_transactions FOR SELECT
  USING (professional_id IN (
    SELECT id FROM professionals WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- =====================================================
-- TABLA: subscription_history
-- =====================================================
CREATE TABLE subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,

  from_plan TEXT,
  to_plan TEXT NOT NULL,

  credits_added INTEGER DEFAULT 0,

  stripe_invoice_id TEXT,
  amount_paid NUMERIC(10,2),

  effective_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_subscription_history_professional ON subscription_history(professional_id, created_at DESC);

-- RLS
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view own subscription history"
  ON subscription_history FOR SELECT
  USING (professional_id IN (
    SELECT id FROM professionals WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- =====================================================
-- STORAGE BUCKET: session-audio
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'session-audio',
  'session-audio',
  false,
  10485760, -- 10MB por archivo
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mp4', 'audio/ogg', 'audio/webm']
);

-- RLS Policies para storage
CREATE POLICY "Professionals can upload own audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'session-audio' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM professionals WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Professionals can view own audio"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'session-audio' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM professionals WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Professionals can delete own audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'session-audio' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM professionals WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para calcular créditos necesarios
CREATE OR REPLACE FUNCTION calculate_credits_for_audio(duration_minutes INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN CEIL(duration_minutes * 1.3);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para verificar si tiene créditos suficientes
CREATE OR REPLACE FUNCTION has_enough_credits(prof_id UUID, required_credits INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT credits_balance INTO current_balance
  FROM professionals
  WHERE id = prof_id;

  RETURN current_balance >= required_credits;
END;
$$ LANGUAGE plpgsql;

-- Función para consumir créditos (con transacción)
CREATE OR REPLACE FUNCTION consume_credits(
  prof_id UUID,
  amount INTEGER,
  session_id UUID,
  description TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  -- Actualizar balance
  UPDATE professionals
  SET credits_balance = credits_balance - amount
  WHERE id = prof_id AND credits_balance >= amount
  RETURNING credits_balance INTO new_balance;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Registrar transacción
  INSERT INTO credit_transactions (
    professional_id,
    amount,
    balance_after,
    transaction_type,
    session_id,
    description
  ) VALUES (
    prof_id,
    -amount,
    new_balance,
    'session_analysis',
    session_id,
    description
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función para agregar créditos
CREATE OR REPLACE FUNCTION add_credits(
  prof_id UUID,
  amount INTEGER,
  transaction_type TEXT,
  description TEXT,
  stripe_payment_intent_id TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE professionals
  SET credits_balance = credits_balance + amount
  WHERE id = prof_id
  RETURNING credits_balance INTO new_balance;

  INSERT INTO credit_transactions (
    professional_id,
    amount,
    balance_after,
    transaction_type,
    description,
    stripe_payment_intent_id
  ) VALUES (
    prof_id,
    amount,
    new_balance,
    transaction_type,
    description,
    stripe_payment_intent_id
  );

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar límites del plan
CREATE OR REPLACE FUNCTION check_plan_limits(prof_id UUID)
RETURNS TABLE(
  can_create_patient BOOLEAN,
  can_upload_audio BOOLEAN,
  patients_count INTEGER,
  patients_limit INTEGER,
  storage_used_mb NUMERIC,
  storage_limit_mb INTEGER,
  credits_remaining INTEGER
) AS $$
DECLARE
  prof RECORD;
  patient_count INTEGER;
BEGIN
  -- Obtener datos del profesional
  SELECT * INTO prof FROM professionals WHERE id = prof_id;

  -- Contar pacientes activos
  SELECT COUNT(*) INTO patient_count
  FROM patients
  WHERE professional_id = prof_id AND is_active = true;

  RETURN QUERY SELECT
    (prof.max_patients IS NULL OR patient_count < prof.max_patients) AS can_create_patient,
    (prof.current_storage_mb < prof.max_storage_mb) AS can_upload_audio,
    patient_count,
    prof.max_patients,
    prof.current_storage_mb,
    prof.max_storage_mb,
    prof.credits_balance;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STORAGE BUCKET CONFIGURATION
-- =====================================================

-- Crear bucket para audios de sesiones
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'session-audio',
  'session-audio',
  false,
  52428800, -- 50 MB por archivo
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/m4a', 'video/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para session-audio bucket
CREATE POLICY "Users can upload their own session audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'session-audio' AND
  (storage.foldername(name))[1] IN (
    SELECT clerk_user_id::text FROM professionals
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  )
);

CREATE POLICY "Users can view their own session audio"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'session-audio' AND
  (storage.foldername(name))[1] IN (
    SELECT clerk_user_id::text FROM professionals
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  )
);

CREATE POLICY "Users can update their own session audio"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'session-audio' AND
  (storage.foldername(name))[1] IN (
    SELECT clerk_user_id::text FROM professionals
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  )
);

CREATE POLICY "Users can delete their own session audio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'session-audio' AND
  (storage.foldername(name))[1] IN (
    SELECT clerk_user_id::text FROM professionals
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  )
);

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================
--
-- PRÓXIMOS PASOS:
-- 1. Ve a tu proyecto en Supabase
-- 2. Abre el SQL Editor
-- 3. Copia y pega este archivo completo
-- 4. Ejecuta (Run)
-- 5. Verifica que todas las tablas se crearon correctamente
-- 6. Verifica que el bucket 'session-audio' se creó en Storage
-- 7. Configura las variables de entorno en .env.local
--
-- =====================================================
