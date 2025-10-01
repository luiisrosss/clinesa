# Plan de Implementación Detallado - Clinesa MVP

## 🎯 Objetivo
Crear una plataforma SaaS para psicólogos individuales con análisis de IA de sesiones, sistema de créditos y planes de suscripción.

---

## 📊 Arquitectura del Sistema de Créditos

### Modelo de Negocio
- **Trial**: 100 créditos totales, 3 pacientes, 50MB, 14 días
- **Solo**: 250 créditos/mes, 10 pacientes, 200MB - €9/mes
- **Practice**: 1200 créditos/mes, ∞ pacientes, 3GB - €29/mes
- **Professional**: 3200 créditos/mes, ∞ pacientes, 10GB - €49/mes

### Consumo de Créditos
- **Audio**: ~1.3 créditos/min de transcripción
- **Acumulables**: No caducan entre renovaciones
- **Compra adicional**: Packs de créditos extra

---

## 🏗️ SPRINT 1: Base de Datos + Autenticación (DÍA 1-2)

### Objetivo
Tener Supabase configurado con esquema completo y Clerk funcionando.

### 1.1 Setup Supabase - Schema Adaptado

**Tabla: `professionals` (psicólogos)**
```sql
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,

  -- Plan y créditos
  subscription_plan TEXT DEFAULT 'trial' CHECK (subscription_plan IN ('trial', 'solo', 'practice', 'professional')),
  credits_balance INTEGER DEFAULT 100, -- Créditos actuales
  credits_total_purchased INTEGER DEFAULT 0, -- Histórico de créditos comprados

  -- Límites del plan
  max_patients INTEGER DEFAULT 3, -- 3 para trial, 10 para solo, null para ilimitado
  max_storage_mb INTEGER DEFAULT 50, -- 50 MB trial, escala según plan
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

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON professionals FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile"
  ON professionals FOR UPDATE
  USING (clerk_user_id = auth.jwt() ->> 'sub');
```

**Tabla: `patients`**
```sql
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
  consent_data_processing JSONB, -- { accepted: bool, date: timestamp, documentVersion: string }
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

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
```

**Tabla: `sessions`**
```sql
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

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
```

**Tabla: `credit_transactions` (Historial de créditos)**
```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,

  amount INTEGER NOT NULL, -- positivo = recarga, negativo = consumo
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription_renewal', 'credit_pack_purchase', 'session_analysis', 'refund', 'adjustment')),

  -- Relaciones
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT,

  description TEXT,
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_professional ON credit_transactions(professional_id, created_at DESC);
CREATE INDEX idx_credit_transactions_session ON credit_transactions(session_id);

-- RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view own transactions"
  ON credit_transactions FOR SELECT
  USING (professional_id IN (
    SELECT id FROM professionals WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));
```

**Tabla: `subscription_history` (Historial de planes)**
```sql
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

CREATE INDEX idx_subscription_history_professional ON subscription_history(professional_id, created_at DESC);

-- RLS
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view own subscription history"
  ON subscription_history FOR SELECT
  USING (professional_id IN (
    SELECT id FROM professionals WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));
```

**Storage Bucket**
```sql
-- Bucket para audio de sesiones
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
```

**Funciones útiles**
```sql
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
```

---

## 🔐 SPRINT 2: Clerk Auth + Onboarding (DÍA 2-3)

### Objetivo
Sistema de autenticación completo con onboarding y creación automática en Supabase.

### 2.1 Instalar Dependencias

```bash
npm install @clerk/nextjs @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### 2.2 Variables de Entorno

**`.env.local`** (local development)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Genkit AI
GOOGLE_GENAI_API_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

### 2.3 Archivos a Crear/Modificar

**`src/middleware.ts`** (NUEVO)
```typescript
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/signin", "/signup", "/api/webhooks/(.*)"],
  ignoredRoutes: ["/api/webhooks/(.*)"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

**`src/app/layout.tsx`** (MODIFICAR)
```typescript
import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations';
import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Clinesa - Gestión Inteligente para Psicólogos',
  description: 'Plataforma de gestión de consulta psicológica con IA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es">
        <body>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
```

**`src/app/signin/page.tsx`** (MODIFICAR COMPLETAMENTE)
```typescript
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl",
            },
          }}
        />
      </div>
    </div>
  );
}
```

**`src/app/signup/page.tsx`** (NUEVO)
```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl",
            },
          }}
        />
      </div>
    </div>
  );
}
```

**`src/app/onboarding/page.tsx`** (NUEVO)
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (isLoaded && user) {
      // Pre-llenar con datos de Clerk
      setName(user.fullName || '');
    }
  }, [isLoaded, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el perfil');
      }

      toast({
        title: '¡Bienvenido a Clinesa!',
        description: `Tu cuenta trial ha sido activada con 100 créditos.`,
      });

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Completa tu perfil</CardTitle>
          <CardDescription>
            Estás a un paso de comenzar tu trial gratuito de 14 días
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Juan Pérez"
                required
              />
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-sm">
              <h4 className="font-semibold mb-2">Tu trial incluye:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ 100 créditos para análisis IA</li>
                <li>✓ Hasta 3 pacientes</li>
                <li>✓ 50 MB de almacenamiento</li>
                <li>✓ 14 días sin compromiso</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Comenzar trial gratuito'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 📡 SPRINT 3: API Routes + Server Actions (DÍA 3-4)

### Objetivo
Conectar Clerk con Supabase y crear las acciones del servidor.

### 3.1 Cliente Supabase

**`src/lib/supabase/client.ts`** (NUEVO)
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './database.types';

export function createClient() {
  return createClientComponentClient<Database>();
}
```

**`src/lib/supabase/server.ts`** (NUEVO)
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export function createServerClient() {
  return createServerComponentClient<Database>({ cookies });
}
```

**`src/lib/supabase/admin.ts`** (NUEVO - para operaciones privilegiadas)
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

### 3.2 API Routes

**`src/app/api/onboarding/route.ts`** (NUEVO)
```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    // Verificar si ya existe
    const { data: existing } = await supabaseAdmin
      .from('professionals')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Profile already exists' });
    }

    // Obtener email de Clerk
    const { clerkClient } = await import('@clerk/nextjs/server');
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 });
    }

    // Crear profesional con trial
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const { data: professional, error } = await supabaseAdmin
      .from('professionals')
      .insert({
        clerk_user_id: userId,
        email,
        name,
        subscription_plan: 'trial',
        credits_balance: 100,
        max_patients: 3,
        max_storage_mb: 50,
        trial_started_at: new Date().toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        is_trial_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ professional });
  } catch (error: any) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3.3 Tipos de Database

**`src/lib/supabase/database.types.ts`** (NUEVO - generado por Supabase CLI)
```typescript
// Este archivo se genera automáticamente con:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/database.types.ts

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
          // Similar a Insert pero todo opcional
        }
      }
      // ... resto de tablas
    }
  }
}
```

---

## 🎨 SPRINT 4: Migrar Componentes Existentes (DÍA 4-6)

### Objetivo
Adaptar los componentes actuales para usar Supabase en lugar de localStorage.

**NOTA**: Vamos a mantener la UI/UX actual que ya funciona bien. Solo cambiamos la lógica de datos.

### 4.1 Server Actions

**`src/actions/professional.ts`** (NUEVO)
```typescript
'use server';

import { auth } from '@clerk/nextjs';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function getProfessionalProfile() {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const { data, error } = await supabaseAdmin
    .from('professionals')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function checkPlanLimits() {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const { data: prof } = await supabaseAdmin
    .from('professionals')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!prof) throw new Error('Professional not found');

  const { data, error } = await supabaseAdmin
    .rpc('check_plan_limits', { prof_id: prof.id });

  if (error) throw error;
  return data[0];
}
```

**`src/actions/patients.ts`** (REEMPLAZAR `src/data/patients.ts`)
```typescript
'use server';

import { auth } from '@clerk/nextjs';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

async function getProfessionalId() {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const { data } = await supabaseAdmin
    .from('professionals')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!data) throw new Error('Professional not found');
  return data.id;
}

export async function getPatients() {
  const professionalId = await getProfessionalId();

  const { data, error } = await supabaseAdmin
    .from('patients')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPatientById(id: string) {
  const professionalId = await getProfessionalId();

  const { data, error } = await supabaseAdmin
    .from('patients')
    .select('*')
    .eq('id', id)
    .eq('professional_id', professionalId)
    .single();

  if (error) throw error;
  return data;
}

export async function createPatient(patientData: any) {
  const professionalId = await getProfessionalId();

  // Verificar límites del plan
  const limits = await supabaseAdmin
    .rpc('check_plan_limits', { prof_id: professionalId });

  if (!limits.data[0].can_create_patient) {
    throw new Error('Has alcanzado el límite de pacientes de tu plan');
  }

  const { data, error } = await supabaseAdmin
    .from('patients')
    .insert({
      ...patientData,
      professional_id: professionalId,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/patients');
  return data;
}

export async function updatePatient(id: string, patientData: any) {
  const professionalId = await getProfessionalId();

  const { data, error } = await supabaseAdmin
    .from('patients')
    .update(patientData)
    .eq('id', id)
    .eq('professional_id', professionalId)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/patients');
  revalidatePath(`/patients/${id}`);
  return data;
}

export async function deletePatient(id: string) {
  const professionalId = await getProfessionalId();

  // Soft delete
  const { error } = await supabaseAdmin
    .from('patients')
    .update({ is_active: false })
    .eq('id', id)
    .eq('professional_id', professionalId);

  if (error) throw error;

  revalidatePath('/patients');
}
```

**`src/actions/sessions.ts`** (REEMPLAZAR `src/data/sessions.ts`)
```typescript
'use server';

import { auth } from '@clerk/nextjs';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

async function getProfessionalId() {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const { data } = await supabaseAdmin
    .from('professionals')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!data) throw new Error('Professional not found');
  return data.id;
}

export async function getSessions() {
  const professionalId = await getProfessionalId();

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select(`
      *,
      patient:patients (
        id,
        name,
        last_name
      )
    `)
    .eq('professional_id', professionalId)
    .order('session_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSessionById(id: string) {
  const professionalId = await getProfessionalId();

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select(`
      *,
      patient:patients (
        id,
        name,
        last_name
      )
    `)
    .eq('id', id)
    .eq('professional_id', professionalId)
    .single();

  if (error) throw error;
  return data;
}

export async function createSession(sessionData: any) {
  const professionalId = await getProfessionalId();

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .insert({
      ...sessionData,
      professional_id: professionalId,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/sessions');
  revalidatePath('/dashboard');
  revalidatePath('/calendar');
  return data;
}

export async function updateSession(id: string, sessionData: any) {
  const professionalId = await getProfessionalId();

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .update(sessionData)
    .eq('id', id)
    .eq('professional_id', professionalId)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/sessions');
  revalidatePath(`/sessions/${id}`);
  revalidatePath('/dashboard');
  revalidatePath('/calendar');
  return data;
}

export async function deleteSession(id: string) {
  const professionalId = await getProfessionalId();

  const { error } = await supabaseAdmin
    .from('sessions')
    .delete()
    .eq('id', id)
    .eq('professional_id', professionalId);

  if (error) throw error;

  revalidatePath('/sessions');
  revalidatePath('/dashboard');
  revalidatePath('/calendar');
}
```

---

## ⏭️ SIGUIENTES SPRINTS

Los siguientes sprints cubrirán:

- **SPRINT 5**: Migrar formularios (new-patient-form, new-session-form)
- **SPRINT 6**: Sistema de upload de audio a Supabase Storage
- **SPRINT 7**: Integración IA mejorada con sistema de créditos
- **SPRINT 8**: Dashboard de créditos y uso
- **SPRINT 9**: Stripe + Webhooks para pagos
- **SPRINT 10**: Exportación y features finales

---

## 🚀 ¿Comenzamos?

Este es el plan detallado de los primeros 4 sprints.

**¿Por dónde quieres empezar?**

1. **Crear el proyecto en Supabase** y ejecutar los SQL schemas
2. **Configurar Clerk** y crear las páginas de auth
3. **Implementar server actions** y migrar data layer
4. **Otro orden que prefieras**

Dime y vamos paso por paso 💪
