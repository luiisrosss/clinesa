# Plan Técnico para Lanzamiento MVP - Clinesa

## 📋 Estado Actual del Proyecto

### ✅ Funcionalidades Implementadas
- **UI/UX Completo**: Landing page, dashboard, calendario (día/semana/mes), pacientes, sesiones
- **Gestión de Pacientes**: Formulario completo con RGPD, datos clínicos, contacto
- **Gestión de Sesiones**: Crear, visualizar, editar sesiones
- **Calendario**: Vistas múltiples (día, semana, mes) con navegación
- **IA (Genkit)**: Transcripción de audio, análisis de insights, métricas conversacionales
- **Componentes UI**: Sistema completo basado en shadcn/ui + Radix UI

### ⚠️ Limitaciones Actuales
- **Almacenamiento**: Solo localStorage (sin persistencia real)
- **Autenticación**: No implementada
- **Multi-usuario**: No soportado
- **Backend**: Sin API real ni base de datos
- **Deploy**: Sin configuración para producción

---

## 🎯 Plan de Migración e Implementación

### FASE 1: Infraestructura Base (Prioridad Alta)
**Duración estimada: 1-2 días**

#### 1.1 Configuración de Supabase
```bash
# Tareas:
- Crear proyecto en Supabase
- Configurar variables de entorno
- Instalar dependencias
```

**Dependencias necesarias:**
```bash
npm install @supabase/supabase-js
npm install -D @supabase/auth-helpers-nextjs
```

**Variables de entorno (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

#### 1.2 Diseño de Base de Datos (Supabase)

**Tabla: `professionals`**
```sql
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON professionals FOR SELECT
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

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_patients_professional ON patients(professional_id);
CREATE INDEX idx_patients_name ON patients(name, last_name);

-- RLS Policies
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

  -- Facturación
  billing JSONB,

  -- IA
  transcription TEXT,
  analysis JSONB,
  metrics JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sessions_patient ON sessions(patient_id);
CREATE INDEX idx_sessions_professional ON sessions(professional_id);
CREATE INDEX idx_sessions_date ON sessions(session_date DESC);

-- RLS Policies
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

**Storage Buckets para archivos:**
```sql
-- Bucket para audio de sesiones
INSERT INTO storage.buckets (id, name, public)
VALUES ('session-audio', 'session-audio', false);

-- Policy para audio
CREATE POLICY "Professionals can upload own audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'session-audio' AND
    auth.jwt() ->> 'sub' IN (
      SELECT clerk_user_id FROM professionals
    )
  );

CREATE POLICY "Professionals can view own audio"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'session-audio' AND
    auth.jwt() ->> 'sub' IN (
      SELECT clerk_user_id FROM professionals
    )
  );
```

---

### FASE 2: Autenticación con Clerk (Prioridad Alta)
**Duración estimada: 1 día**

#### 2.1 Configuración de Clerk

**Dependencias:**
```bash
npm install @clerk/nextjs
```

**Variables de entorno (.env.local):**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

#### 2.2 Estructura de Archivos a Modificar/Crear

**Nuevo: `src/middleware.ts`**
```typescript
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/signin", "/signup"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

**Modificar: `src/app/layout.tsx`**
```typescript
import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**Modificar: `src/app/signin/page.tsx`**
```typescript
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

**Nuevo: `src/app/signup/page.tsx`**
```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

**Nuevo: `src/app/onboarding/page.tsx`**
- Formulario para completar perfil profesional
- Crear registro en tabla `professionals` de Supabase

---

### FASE 3: Migración de Data Layer (Prioridad Alta)
**Duración estimada: 2-3 días**

#### 3.1 Crear Cliente Supabase

**Nuevo: `src/lib/supabase/client.ts`**
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/supabase/database.types';

export const createClient = () => {
  return createClientComponentClient<Database>();
};
```

**Nuevo: `src/lib/supabase/server.ts`**
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase/database.types';

export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies });
};
```

#### 3.2 Refactorizar Data Layer

**Reemplazar: `src/data/patients.ts`**
- Cambiar de localStorage a Supabase
- Implementar CRUD completo con manejo de errores
- Agregar tipos TypeScript desde Supabase

**Reemplazar: `src/data/sessions.ts`**
- Cambiar de localStorage a Supabase
- Implementar CRUD completo con manejo de errores
- Agregar tipos TypeScript desde Supabase

#### 3.3 Server Actions

**Nuevo: `src/actions/patients.ts`**
```typescript
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs';

export async function createPatient(data: PatientInput) {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = createServerClient();

  // Obtener professional_id del usuario de Clerk
  const { data: professional } = await supabase
    .from('professionals')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!professional) throw new Error('Professional not found');

  const { data: patient, error } = await supabase
    .from('patients')
    .insert({ ...data, professional_id: professional.id })
    .select()
    .single();

  if (error) throw error;
  return patient;
}
```

**Nuevo: `src/actions/sessions.ts`**
- Implementar createSession, updateSession, deleteSession
- Manejo de uploads de audio a Supabase Storage

---

### FASE 4: Migración de Componentes (Prioridad Media)
**Duración estimada: 2 días**

#### 4.1 Componentes a Modificar

**Lista de cambios:**
1. `src/components/patients/new-patient-form.tsx`
   - Usar server action en lugar de localStorage
   - Agregar loading states
   - Mejorar manejo de errores

2. `src/components/sessions/new-session-form.tsx`
   - Usar server action en lugar de localStorage
   - Agregar loading states
   - Upload de audio a Supabase Storage

3. `src/components/sessions/session-details-client.tsx`
   - Fetch desde Supabase
   - Real-time subscriptions (opcional)

4. `src/app/(app)/dashboard/page.tsx`
   - Fetch sesiones desde Supabase
   - Agregar loading states

5. `src/app/(app)/patients/page.tsx`
   - Fetch pacientes desde Supabase
   - Paginación

6. `src/app/(app)/sessions/page.tsx`
   - Fetch sesiones desde Supabase
   - Filtros y búsqueda

7. `src/components/calendar/*`
   - Integrar con Supabase para sesiones reales

---

### FASE 5: Features Faltantes para MVP (Prioridad Media)
**Duración estimada: 3-4 días**

#### 5.1 Sistema de Audio Recording
**Nuevo: `src/components/audio-recorder.tsx`**
- Grabar audio directamente desde navegador
- Preview antes de guardar
- Upload a Supabase Storage
- Progress indicator

#### 5.2 Edición de Pacientes
**Nuevo: `src/app/(app)/patients/[id]/page.tsx`**
- Vista de detalle de paciente
- Formulario de edición
- Historial de sesiones

#### 5.3 Edición de Sesiones
**Modificar: `src/components/sessions/session-details-client.tsx`**
- Modo edición inline
- Actualización en tiempo real
- Validaciones

#### 5.4 Búsqueda y Filtros
**Nuevo: `src/components/search-filter-bar.tsx`**
- Búsqueda de pacientes por nombre
- Filtros por riesgo, fecha, estado
- Aplicar en pacientes y sesiones

#### 5.5 Notificaciones y Recordatorios
**Nuevo: `src/lib/notifications.ts`**
- Email notifications con Resend o similar
- Recordatorios de citas próximas
- Confirmaciones de acciones

---

### FASE 6: Optimización y Deploy (Prioridad Alta)
**Duración estimada: 1-2 días**

#### 6.1 Configuración de Vercel

**Archivo: `vercel.json`**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "@clerk-publishable-key",
    "CLERK_SECRET_KEY": "@clerk-secret-key"
  }
}
```

#### 6.2 Optimizaciones Pre-Deploy

**Checklist:**
- [ ] Activar TypeScript strict mode (quitar ignoreBuildErrors)
- [ ] Resolver todos los errores de lint
- [ ] Optimizar imágenes (next/image)
- [ ] Lazy loading de componentes pesados
- [ ] Implementar caching estratégico
- [ ] Error boundaries en componentes críticos
- [ ] Loading states en todas las operaciones async
- [ ] Meta tags y SEO básico
- [ ] Analytics (opcional: Vercel Analytics)

#### 6.3 Testing Pre-Launch

**Tests manuales críticos:**
- [ ] Registro e inicio de sesión
- [ ] Crear, editar, eliminar paciente
- [ ] Crear, editar, eliminar sesión
- [ ] Upload de audio
- [ ] Transcripción y análisis IA
- [ ] Calendario (todas las vistas)
- [ ] Responsive design (móvil/tablet/desktop)
- [ ] Permisos y seguridad (RLS)

---

### FASE 7: Features Post-MVP (Prioridad Baja)
**Para después del lanzamiento inicial**

#### 7.1 Analytics Dashboard
- Métricas de uso de la plataforma
- KPIs clínicos (sesiones/mes, tasa de cancelación)
- Gráficos con Recharts

#### 7.2 Exportación de Datos
- PDF de historiales de pacientes
- CSV de sesiones
- Backup completo

#### 7.3 Integraciones
- Google Calendar sync
- Zoom/Meet para sesiones online
- Pasarelas de pago (Stripe)

#### 7.4 Multi-idioma
- i18n con next-intl
- Soporte español/inglés/catalán

#### 7.5 App Móvil (PWA)
- Manifest.json
- Service Worker
- Offline mode básico

---

## 🚀 Orden de Implementación Recomendado

### Semana 1 (Crítico)
1. **Día 1-2**: FASE 1 - Configurar Supabase + Crear schemas
2. **Día 3**: FASE 2 - Implementar Clerk
3. **Día 4-5**: FASE 3 - Migrar data layer a Supabase

### Semana 2 (Crítico)
4. **Día 1-2**: FASE 4 - Migrar componentes principales
5. **Día 3-4**: FASE 5 - Features faltantes (audio, edición)
6. **Día 5**: FASE 6 - Testing y fixes

### Semana 3 (Launch)
7. **Día 1**: FASE 6 - Deploy a Vercel
8. **Día 2**: Testing en producción
9. **Día 3-5**: Fixes post-launch + monitoreo

---

## 📦 Dependencias Completas a Instalar

```bash
# Supabase
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Clerk
npm install @clerk/nextjs @clerk/themes

# Utilidades
npm install sonner # Para toasts mejorados
npm install nuqs # Para query params
npm install resend # Para emails
npm install @vercel/analytics # Analytics

# Dev
npm install -D @types/node
```

---

## 🔐 Variables de Entorno Completas

**Archivo: `.env.local`**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Genkit AI (ya existentes)
GOOGLE_GENAI_API_KEY=xxx

# Opcional
RESEND_API_KEY=re_xxx
```

---

## 📊 Checklist Final Pre-Launch

### Funcionalidad
- [ ] Autenticación completa (registro, login, logout)
- [ ] CRUD pacientes completo
- [ ] CRUD sesiones completo
- [ ] Upload y transcripción de audio
- [ ] Calendario funcional
- [ ] Dashboard con métricas básicas

### Seguridad
- [ ] RLS policies configuradas correctamente
- [ ] Variables de entorno en Vercel
- [ ] HTTPS activado
- [ ] Rate limiting (Clerk)
- [ ] Validación de inputs

### UX/UI
- [ ] Loading states en todas las acciones
- [ ] Error handling user-friendly
- [ ] Responsive en todos los dispositivos
- [ ] Feedback visual (toasts, modals)

### Legal/Compliance
- [ ] Política de privacidad
- [ ] Términos de servicio
- [ ] RGPD compliance
- [ ] Banner de cookies

### Técnico
- [ ] Build sin errores
- [ ] Lighthouse score > 90
- [ ] No console.errors en producción
- [ ] Monitoring configurado

---

## 🆘 Riesgos y Mitigaciones

### Riesgo 1: Migración de datos existentes
**Mitigación**: Implementar script de migración de localStorage a Supabase en primera carga

### Riesgo 2: Costos de Supabase/Clerk
**Mitigación**:
- Supabase free tier: 500MB DB, 1GB storage, 50K MAU
- Clerk free tier: 10K MAU
- Monitorear uso constantemente

### Riesgo 3: Performance con IA (Genkit)
**Mitigación**:
- Implementar queue system
- Mostrar progress en tiempo real
- Timeout y retry logic

### Riesgo 4: Compliance RGPD
**Mitigación**:
- Auditoría legal antes de lanzar
- Implementar derecho al olvido
- Logs de consentimientos

---

## 📝 Notas Finales

- **Tiempo estimado total**: 2-3 semanas para MVP completo
- **Costo mensual estimado**:
  - Vercel: $0 (Hobby) o $20 (Pro)
  - Supabase: $0-25
  - Clerk: $0-25
  - Total: $0-70/mes
- **Next steps post-MVP**: Analytics, exportación, integraciones

---

Este plan es flexible y puede ajustarse según prioridades y recursos disponibles.
