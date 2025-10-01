# 🚀 Instrucciones de Setup - Clinesa

## ✅ Paso 1: Verificar Instalación de Dependencias

Las dependencias ya están instaladas. Si necesitas reinstalar:

```bash
npm install
```

## 📊 Paso 2: Configurar Base de Datos en Supabase

### 2.1 Ejecutar el Schema SQL

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Abre el **SQL Editor** (icono en el menú lateral)
3. Crea una nueva query
4. Copia y pega **TODO** el contenido del archivo `supabase-schema.sql`
5. Haz clic en **Run** o presiona `Ctrl+Enter`
6. Verifica que se ejecutó correctamente (sin errores rojos)

### 2.2 Verificar Tablas Creadas

Ve a **Table Editor** y verifica que existen:
- ✅ professionals
- ✅ patients
- ✅ sessions
- ✅ credit_transactions
- ✅ subscription_history

Ve a **Storage** y verifica:
- ✅ Bucket `session-audio` creado

## 🔐 Paso 3: Configurar Clerk

### 3.1 Crear/Configurar Aplicación en Clerk

1. Ve a https://dashboard.clerk.com/
2. Si no tienes aplicación, crea una nueva:
   - Click en "Add application"
   - Nombre: "Clinesa"
   - Selecciona: Email, Google (opcional)
3. Ve a **Configure** → **Email, Phone, Username**
   - Asegúrate que **Email** está activado como requerido
4. Ve a **Configure** → **Restrictions**
   - Configura según tus necesidades

### 3.2 Copiar API Keys

1. Ve a **API Keys** en el menú
2. Copia los valores que necesitarás en el siguiente paso

## ⚙️ Paso 4: Configurar Variables de Entorno

### 4.1 Crear archivo .env.local

1. Copia el archivo `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

2. Abre `.env.local` y completa con tus valores reales

### 4.2 Obtener Valores de Supabase

1. Ve a tu proyecto en Supabase
2. Ve a **Project Settings** (icono engranaje) → **API**
3. Copia:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANTE**: El `service_role` key tiene permisos completos. ¡NUNCA lo expongas en el frontend!

### 4.3 Obtener Valores de Clerk

1. En tu dashboard de Clerk
2. Ve a **API Keys**
3. Copia:
   - **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret key** → `CLERK_SECRET_KEY`

### 4.4 Tu archivo .env.local debería verse así:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Genkit AI (ya lo tienes configurado)
GOOGLE_GENAI_API_KEY=tu_api_key_actual

# App
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

## 🎯 Paso 5: Probar el Setup

### 5.1 Iniciar el servidor de desarrollo

```bash
npm run dev
```

Debería iniciar en: http://localhost:9002

### 5.2 Probar Flujo Completo

1. **Landing Page**: Abre http://localhost:9002
   - ✅ Debería mostrar el landing page actual

2. **Registro**: Ve a http://localhost:9002/signup
   - ✅ Debería mostrar formulario de Clerk
   - Crea una cuenta de prueba

3. **Onboarding**: Después del registro
   - ✅ Debería redirigir a `/onboarding`
   - Completa tu nombre
   - Click en "Comenzar trial gratuito"

4. **Dashboard**: Después del onboarding
   - ✅ Debería redirigir a `/dashboard`
   - Debería mostrar "Bienvenido a Clinesa"

5. **Verificar Base de Datos**:
   - Ve a Supabase → Table Editor → `professionals`
   - ✅ Debería existir tu registro con:
     - `clerk_user_id` lleno
     - `credits_balance: 100`
     - `subscription_plan: trial`

## 🐛 Troubleshooting

### Error: "Missing environment variables"
- Verifica que `.env.local` existe en la raíz del proyecto
- Verifica que todas las variables están completas
- Reinicia el servidor (`npm run dev`)

### Error al crear profesional en onboarding
- Ve a Supabase → SQL Editor
- Ejecuta: `SELECT * FROM professionals;`
- Si ya existe un registro, bórralo o usa otra cuenta de Clerk

### Clerk no se muestra
- Verifica que las API keys de Clerk están correctas
- Verifica que no hay errores en la consola del navegador
- Verifica que el dominio en Clerk incluye `localhost:9002`

### RLS Policy error en Supabase
- Asegúrate de que ejecutaste TODO el `supabase-schema.sql`
- Las policies necesitan el JWT de Clerk para funcionar
- Por ahora, puedes desactivar RLS temporalmente para debugging:
  ```sql
  ALTER TABLE professionals DISABLE ROW LEVEL SECURITY;
  ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
  ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
  ```

## ✨ Próximos Pasos

Una vez que todo funcione:

1. **Migrar Componentes**: Actualizar los componentes existentes para usar las server actions
2. **Upload de Audio**: Implementar subida de archivos a Supabase Storage
3. **Sistema de Créditos**: Integrar el consumo de créditos con la IA
4. **Stripe**: Configurar pagos y suscripciones

---

## 📝 Notas Importantes

- **RLS Policies**: Todas las tablas tienen Row Level Security activado
- **Service Role Key**: Solo se usa en server actions (nunca en cliente)
- **Clerk JWT**: Se pasa automáticamente a Supabase para las policies
- **Trial**: Cada nuevo usuario obtiene automáticamente 100 créditos y 14 días

---

¿Algún error? Revisa la consola del navegador y los logs del servidor.
