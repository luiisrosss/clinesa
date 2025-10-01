# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clinesa is a Next.js-based psychology practice management application with AI-powered session analysis capabilities. It provides patient management, session tracking, calendar views, and AI features for transcribing and analyzing therapy sessions.

## Development Commands

```bash
# Development server (runs on port 9002 with Turbopack)
npm run dev

# Genkit AI development server
npm run genkit:dev

# Genkit AI with watch mode
npm run genkit:watch

# Type checking (without emitting files)
npm run typecheck

# Linting
npm run lint

# Production build
npm run build

# Start production server
npm start
```

## Architecture

### Route Structure

The app uses Next.js App Router with route groups:

- **/signin** - Landing/authentication page (root redirects here)
- **(app)/** - Main application layout with sidebar navigation
  - **/dashboard** - Overview and metrics
  - **/patients** - Patient list and management
  - **/patients/new** - New patient registration
  - **/sessions** - Session list
  - **/sessions/new** - Create new session
  - **/sessions/[id]** - Session details and analysis
  - **/calendar** - Calendar views (day/week/month)

### Data Layer

**Client-side storage** using localStorage (no backend database currently):

- `src/data/patients.ts` - Patient CRUD operations (key: `clinesa-patients`)
- `src/data/sessions.ts` - Session CRUD operations (key: `clinesa-sessions`)

All data functions check for `typeof window === "undefined"` to handle SSR/build scenarios.

### AI Integration (Genkit)

AI functionality is built using Firebase Genkit with Google AI (Gemini 2.5 Flash):

- `src/ai/genkit.ts` - Genkit configuration and initialization
- `src/ai/flows/` - Three main AI flows:
  - **transcribe-audio-session.ts** - Transcribe audio (mp3/mp4 data URIs) to text
  - **analyze-session-insights.ts** - Extract summary, key points, emotional cues, and metrics from transcripts
  - **capture-conversation-metrics.ts** - Analyze speaker time and response intensity
- `src/lib/actions.ts` - Server actions that wrap AI flows for client consumption

AI flows use Zod schemas for input/output validation and are marked with `'use server'`.

### Type System

Core types defined in `src/lib/types.ts`:

- **Patient** - Comprehensive patient record including RGPD compliance fields, clinical data, and administrative info
- **Session** - Session record with clinical notes, treatment goals, risk screening, diagnosis (DSM-5-TR/CIE-10/CIE-11), applied techniques, scales (PHQ-9, GAD-7), billing, and AI-generated fields (transcription, analysis, metrics)

### Component Organization

- `src/components/ui/` - shadcn/ui components (Radix UI + Tailwind)
- `src/components/landing/` - Landing page sections (hero, features, pricing, testimonials, FAQ, CTA)
- `src/components/sessions/` - Session-specific components (card, details, new form)
- `src/components/patients/` - Patient-specific components (new form)
- `src/components/calendar/` - Calendar views (day, week, month)
- `src/app-sidebar-content.tsx` - Main navigation sidebar

### Styling

- Tailwind CSS with custom configuration
- `class-variance-authority` for component variants
- `tailwind-merge` and `clsx` via `src/lib/utils.ts` `cn()` helper
- Remote images allowed from: placehold.co, images.unsplash.com, picsum.photos

## Important Notes

- **Build configuration**: TypeScript and ESLint errors are ignored during builds (`ignoreBuildErrors: true`, `ignoreDuringBuilds: true`)
- **Import alias**: `@/*` maps to `src/*`
- **Port**: Development server runs on port 9002 (not default 3000)
- **AI Model**: Uses `googleai/gemini-2.5-flash` via Genkit
- **Form validation**: Uses react-hook-form with @hookform/resolvers and Zod schemas
- **No Firebase backend**: Despite the name "clinesa firebase", there's no firebase.json or Firestore integration - data is localStorage-based
