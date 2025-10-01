# 🛠️ Tech Stack - Clinesa

> **Última actualización**: 2025-10-01
> **Versión**: MVP v1.0

---

## 📋 Stack Overview

```
┌─────────────────────────────────────────────────────────┐
│                   CLINESA TECH STACK                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend: Next.js 15 + React 18 + TypeScript         │
│  UI: Tailwind CSS + shadcn/ui + Radix UI              │
│  Auth: Clerk (OAuth, MFA, Spanish)                    │
│  Database: Supabase PostgreSQL                         │
│  Storage: Supabase Storage                             │
│  AI: Firebase Genkit + Google Gemini                  │
│  Payments: Stripe (TODO)                              │
│  Hosting: Vercel                                       │
│  Version Control: Git + GitHub                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Stack

### Next.js 15.3.3

**Por qué Next.js**:
- ✅ App Router moderno con Server Components
- ✅ Server Actions para mutaciones sin API routes
- ✅ Optimización automática de imágenes
- ✅ Edge runtime support
- ✅ Excelente DX con Turbopack
- ✅ Deploy simple en Vercel

**Configuración**:
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Temporal MVP
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporal MVP
  },
  output: 'standalone', // Para Vercel
  images: {
    remotePatterns: [
      { hostname: 'placehold.co' },
      { hostname: 'images.unsplash.com' },
      { hostname: 'picsum.photos' },
    ],
  },
};
```

**Scripts**:
```json
{
  "dev": "next dev --turbopack -p 9002",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit"
}
```

---

### React 18.3.1

**Features usadas**:
- ✅ Hooks (useState, useEffect, useMemo, useCallback)
- ✅ Context API (para temas, providers)
- ✅ Suspense boundaries (para loading states)
- ⏳ useOptimistic (futuro - React 19)
- ⏳ useFormStatus (futuro - React 19)

**Patterns**:
- Composition over inheritance
- Controlled components
- Custom hooks para lógica reusable

---

### TypeScript 5.x

**Configuración**:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Uso**:
- ✅ Strict mode activado
- ✅ Tipos explícitos en funciones públicas
- ✅ Interfaces para estructuras de datos
- ✅ Generics donde sea necesario
- ❌ Evitar `any` (usar `unknown`)
- ❌ Evitar `@ts-ignore` sin comentario

---

### Tailwind CSS 3.4.1

**Por qué Tailwind**:
- ✅ Utility-first para prototipado rápido
- ✅ Mobile-first por defecto
- ✅ Purge automático de CSS no usado
- ✅ Excelente con componentes
- ✅ Temas y dark mode built-in

**Configuración**:
```javascript
// tailwind.config.ts
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui variables
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
```

**Utilities custom**:
```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

### shadcn/ui + Radix UI

**Por qué shadcn/ui**:
- ✅ Componentes copiables (no npm dependency hell)
- ✅ Totalmente customizable
- ✅ Accesibilidad built-in (Radix)
- ✅ Tipos TypeScript perfectos
- ✅ Tailwind native

**Componentes usados**:
```typescript
// UI Components
- Button
- Card (CardHeader, CardTitle, CardContent, etc.)
- Input, Textarea, Label
- Select, Checkbox, RadioGroup, Switch
- Dialog, Sheet, Popover, Tooltip
- Accordion, Collapsible, Tabs
- Avatar, Badge, Progress, Skeleton
- Toast (notificaciones)
- Sidebar (navegación)
- Calendar, DatePicker
- Carousel
- Chart (con Recharts)
```

**Instalación**:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
# etc...
```

---

### Otras Librerías Frontend

| Librería | Versión | Uso |
|----------|---------|-----|
| **react-hook-form** | 7.54.2 | Formularios con validación |
| **@hookform/resolvers** | 4.1.3 | Integración Zod + RHF |
| **zod** | 3.24.2 | Validación de schemas |
| **date-fns** | 3.6.0 | Manipulación de fechas |
| **lucide-react** | 0.475.0 | Iconos |
| **recharts** | 2.15.1 | Gráficos y charts |
| **embla-carousel-react** | 8.6.0 | Carousels |

---

## 🔐 Authentication Stack

### Clerk 6.33.1

**Por qué Clerk**:
- ✅ Setup en <5 minutos
- ✅ OAuth social (Google, GitHub, etc.)
- ✅ MFA / 2FA built-in
- ✅ Localización en español
- ✅ Session management automático
- ✅ Webhooks para sync con BD

**Features usadas**:
- Sign up / Sign in components
- User button y user profile
- JWT tokens para Supabase RLS
- Middleware para protección de rutas
- Spanish localization (`esES`)

**Setup**:
```typescript
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={esES}>
      {children}
    </ClerkProvider>
  );
}

// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/signin(.*)',
  '/signup(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

**Variables de entorno**:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

---

## 🗄️ Database Stack

### Supabase (PostgreSQL 15)

**Por qué Supabase**:
- ✅ PostgreSQL real (no limitado como Firebase)
- ✅ Row Level Security (RLS) built-in
- ✅ Realtime subscriptions
- ✅ Storage para archivos
- ✅ Auto-generated API
- ✅ Edge functions (futuro)

**Features usadas**:
- Relational tables con foreign keys
- RLS policies para multi-tenancy
- JSONB para datos flexibles
- Functions y triggers SQL
- Storage buckets para audio

**Clientes**:
```typescript
// Browser (use client)
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

// Server Components
import { createServerClient } from '@/lib/supabase/server';
const supabase = await createServerClient();

// Server Actions (privileged)
import { supabaseAdmin } from '@/lib/supabase/admin';
// Usa service role key
```

**Schema**:
- 5 tablas principales (professionals, patients, sessions, credit_transactions, subscription_history)
- 1 storage bucket (session-audio)
- 5 funciones SQL utilitarias
- RLS en todas las tablas

**Variables de entorno**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Solo server-side!
```

---

### Supabase Storage

**Configuración**:
```sql
-- Bucket: session-audio
- Max file size: 10MB
- Allowed MIME types:
  - audio/mpeg
  - audio/mp3
  - audio/wav
  - audio/m4a
  - audio/mp4
  - audio/ogg
  - audio/webm
```

**RLS Policies**:
- Professionals solo pueden subir a su carpeta
- Path pattern: `{professional_id}/{session_id}/audio.ext`
- Solo el owner puede leer/borrar

**Upload flow**:
```typescript
const { data, error } = await supabase.storage
  .from('session-audio')
  .upload(`${professionalId}/${sessionId}/audio.mp3`, file);
```

---

## 🤖 AI Stack

### Firebase Genkit 1.20.0

**Por qué Genkit**:
- ✅ Framework específico para IA generativa
- ✅ Integración fácil con Next.js
- ✅ Type-safe flows
- ✅ Dev UI para testing
- ✅ Tracing y monitoring built-in

**Setup**:
```typescript
// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
```

**Flows creados**:
1. **transcribeAudioSession**: Audio → Text
2. **analyzeSessionInsights**: Text → Summary + KeyPoints + Emotions
3. **captureConversationMetrics**: Text → Speaker time + Intensity

---

### Google Gemini 2.5 Flash

**Por qué Gemini**:
- ✅ Multimodal (audio + texto)
- ✅ Context window grande (32K tokens)
- ✅ Rápido y barato
- ✅ Español nativo
- ✅ Streaming support

**Modelo**: `googleai/gemini-2.5-flash`

**Pricing**:
- Input: $0.075 / 1M tokens
- Output: $0.30 / 1M tokens
- Audio: Similar a texto

**Consumo estimado**:
- 30 min audio ≈ 15K tokens
- Análisis ≈ 5K tokens
- Total: ~20K tokens ≈ $0.006 por sesión

**Variables de entorno**:
```env
GOOGLE_GENAI_API_KEY=AIza...
```

---

### Zod (Validación de Schemas)

**Uso en IA**:
```typescript
import { z } from 'genkit';

const InputSchema = z.object({
  audioDataUri: z.string().describe('Audio en base64'),
});

const OutputSchema = z.object({
  transcription: z.string(),
});

const flow = ai.defineFlow({
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  // ...
});
```

**Beneficios**:
- ✅ Type safety en inputs/outputs
- ✅ Validación automática
- ✅ Error handling robusto
- ✅ Auto-documentation

---

## 💳 Payments Stack (TODO - Sprint 9)

### Stripe

**Por qué Stripe**:
- ✅ Líder del mercado
- ✅ Excelente DX
- ✅ Suscripciones built-in
- ✅ Webhooks confiables
- ✅ Soporte en España

**Productos**:
- Stripe Checkout (hosted)
- Stripe Billing (subscriptions)
- Stripe Customer Portal (self-service)

**Webhooks necesarios**:
```typescript
// Eventos a escuchar
- checkout.session.completed
- invoice.payment_succeeded
- invoice.payment_failed
- customer.subscription.updated
- customer.subscription.deleted
```

**Estructura de precios**:
```typescript
const plans = {
  solo: {
    priceId: 'price_xxx',
    amount: 900, // €9
    credits: 250,
  },
  practice: {
    priceId: 'price_xxx',
    amount: 2900, // €29
    credits: 1200,
  },
  professional: {
    priceId: 'price_xxx',
    amount: 4900, // €49
    credits: 3200,
  },
};
```

---

## 🚀 Deployment Stack

### Vercel

**Por qué Vercel**:
- ✅ Creadores de Next.js
- ✅ Deploy automático en push
- ✅ Preview deployments en PRs
- ✅ Edge network global
- ✅ Analytics built-in
- ✅ Free tier generoso

**Configuración**:
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install"
}
```

**Variables de entorno**:
- Todas configuradas en Vercel Dashboard
- Separadas por environment (preview/production)
- Secrets para keys sensibles

**Domains**:
- Production: `clinesa.vercel.app` (o custom)
- Preview: `clinesa-git-{branch}.vercel.app`

---

### GitHub

**Workflow**:
```
1. Local development
2. git push → GitHub
3. Vercel auto-deploy
4. Tests en preview (manual)
5. Merge to main → Production
```

**Branch strategy**:
- `main`: Producción
- `feat/*`: Features nuevos
- `fix/*`: Bug fixes
- `refactor/*`: Refactors

**Protecciones**:
- No push directo a main
- PR reviews requeridos (futuro)
- Status checks: build success

---

## 📦 Package Management

### npm

**Por qué npm**:
- ✅ Default de Node.js
- ✅ Lockfile determinístico
- ✅ Workspaces support
- ✅ Scripts lifecycle hooks

**Scripts importantes**:
```json
{
  "dev": "next dev --turbopack -p 9002",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "genkit:dev": "genkit start -- tsx src/ai/dev.ts",
  "genkit:watch": "genkit start -- tsx --watch src/ai/dev.ts"
}
```

**Dependencies clave**:
```json
{
  "next": "15.3.3",
  "react": "18.3.1",
  "@clerk/nextjs": "6.33.1",
  "@supabase/supabase-js": "2.58.0",
  "genkit": "1.20.0",
  "tailwindcss": "3.4.1",
  "typescript": "5.x"
}
```

---

## 🔧 Development Tools

### VS Code (Recomendado)

**Extensions**:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Error Lens
- TypeScript Error Translator
- GitLens
- TODO Highlight

**Settings**:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

### ESLint + Prettier

**Configuración**:
```javascript
// .eslintrc.js
module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
  },
};
```

**Prettier** (futuro):
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## 📊 Monitoring & Analytics (Futuro)

### Vercel Analytics

**Features**:
- Web Vitals (CLS, FCP, LCP, etc.)
- Page views
- Geographic distribution
- Device breakdown

### Sentry (Error Tracking)

**Setup** (futuro):
```bash
npm install @sentry/nextjs
```

**Features**:
- Error tracking
- Performance monitoring
- Release tracking
- User feedback

### Posthog (Product Analytics)

**Setup** (futuro):
```bash
npm install posthog-js
```

**Features**:
- Event tracking
- Funnels
- Session recording
- Feature flags

---

## 🧪 Testing Stack (TODO)

### Vitest (Unit Tests)

```bash
npm install -D vitest @testing-library/react
```

**Coverage target**: >80%

### Playwright (E2E Tests)

```bash
npm install -D @playwright/test
```

**Tests críticos**:
- Sign up → Onboarding → Dashboard
- Crear paciente
- Crear sesión → Upload audio → Transcribir

---

## 🔒 Security Stack

### Protecciones Implementadas

1. **Authentication**: Clerk con MFA support
2. **Authorization**: RLS en Supabase
3. **Input Validation**: Zod en server actions
4. **Environment Variables**: Secrets en Vercel
5. **HTTPS**: Forzado por Vercel
6. **CORS**: Configurado en API routes

### Próximas Mejoras

- [ ] Rate limiting (Upstash Redis)
- [ ] CSRF tokens
- [ ] Content Security Policy
- [ ] Audit logs
- [ ] Backup automático de BD

---

## 📈 Performance Optimizations

### Implementadas

- ✅ Next.js Image optimization
- ✅ Code splitting automático
- ✅ Server Components por defecto
- ✅ Turbopack en dev
- ✅ Edge runtime donde posible

### Futuras

- [ ] React Suspense boundaries
- [ ] Streaming SSR
- [ ] ISR (Incremental Static Regeneration)
- [ ] Service Worker (PWA)
- [ ] CDN caching strategies

---

## 🌍 Localization (i18n)

### Actual

- Español (es-ES) por defecto
- Clerk en español
- Contenido hardcoded en español

### Futuro

- [ ] next-intl para i18n
- [ ] Inglés (en-US)
- [ ] Catalán (ca-ES)
- [ ] Portugués (pt-PT)

---

## 📚 Documentation Tools

### Actual

- Markdown files en `/context`
- JSDoc comments en código
- README.md básico

### Futuro

- [ ] Storybook para componentes
- [ ] TypeDoc para API docs
- [ ] Swagger para API routes
- [ ] Video tutorials

---

## 🔄 Migration Strategy

### De localStorage a Supabase

**Estrategia**:
1. Mantener compatibilidad temporal
2. Migrar datos en primera carga (si existen)
3. Mostrar banner "Migración completada"
4. Remover código de localStorage en Sprint 6

**Código**:
```typescript
async function migrateFromLocalStorage() {
  const localPatients = localStorage.getItem('clinesa-patients');

  if (localPatients) {
    const patients = JSON.parse(localPatients);

    for (const patient of patients) {
      await createPatient(patient);
    }

    localStorage.removeItem('clinesa-patients');
  }
}
```

---

## 🎯 Tech Debt Tracking

### Alta Prioridad

- [ ] Activar TypeScript strict mode
- [ ] Remover ignoreBuildErrors
- [ ] Agregar tests unitarios
- [ ] Documentar todos los componentes

### Media Prioridad

- [ ] Refactor componentes grandes
- [ ] Extraer lógica a custom hooks
- [ ] Mejorar error handling
- [ ] Agregar loading skeletons everywhere

### Baja Prioridad

- [ ] Optimizar bundle size
- [ ] Implementar code splitting manual
- [ ] Mejorar accesibilidad (ARIA)
- [ ] Dark mode

---

## 📊 Metrics & KPIs

### Development

- Build time: <60s
- Bundle size: <500KB
- Lighthouse score: >90

### Runtime

- Time to Interactive: <3s
- API response time: <500ms
- AI processing time: <30s per session

---

> **Última actualización**: 2025-10-01
> **Stack estable**: ✅ Sí
> **Breaking changes previstos**: ❌ No
> **Próxima revisión**: Q2 2025
