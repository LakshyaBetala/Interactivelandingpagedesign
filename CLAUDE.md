# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> The note in AGENTS.md is real: this uses **Next.js 16.2 / React 19** with the React Compiler enabled. Conventions differ from older Next.js — consult `node_modules/next/dist/docs/` before relying on remembered APIs.

## Commands

```bash
npm i            # install deps
npm run dev      # dev server (Next.js)
npm run build    # production build
npm run lint     # eslint (flat config, eslint-config-next)
npx tsc --noEmit # typecheck — there is no test suite; use this to verify changes
```

There are no automated tests. After editing, verify with `npx tsc --noEmit` and `npm run lint`.

## Environment

Supabase config lives in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (also `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)

`src/lib/supabaseClient.ts` falls back to placeholder values when these are absent. The app detects this at runtime (`checkSupabaseStatus` in CRMContext) and runs in **offline/mock mode**, seeding state from the `INITIAL_*` constants instead of the database. Code paths must keep working in both modes.

## Architecture

This is **two apps in one Next.js project**, sharing only the design tokens in `globals.css`:

1. **Marketing site** — `src/app/page.tsx` + `src/components/*` (non-`crm`). A static, SEO-heavy landing page (hero, service chapters, case study). SEO is first-class: `src/app/layout.tsx` holds metadata, `SchemaMarkup.tsx` injects JSON-LD, and `sitemap.ts` / `robots.ts` / `icon.tsx` are generated routes.

2. **CRM portal** — `src/app/portal/*` + `src/components/crm/*`. The substance of the app. Everything funnels through one large context provider.

### CRM data flow (the core thing to understand)

`CRMContext.tsx` (~1900 lines) is the single source of truth — all state, Supabase reads/writes, and type definitions live here. `src/app/portal/page.tsx` wraps everything in `<CRMProvider>` and consumes `useCRM()`.

**Role-based rendering.** A logged-in user resolves to a `userProfile.category` of `admin`, `intern`, or `client`:
- `admin` / `intern` → `AdminDashboard.tsx` (interns get a filtered subset of tabs via `allowedTabs`; admins also see the Access Management tab and an Admin/Client view switcher).
- `client` → `ClientPortalView.tsx` (a sandboxed single-project view).

**Profile resolution & the source-of-truth rule.** On login (`loadSession` in CRMContext), the profile is assembled from the Supabase `profiles` table row **first**, with the auth JWT `user_metadata` only as a fallback. This ordering matters: `user_metadata` is frozen at signup and cannot be edited for *other* users from the client, so the `profiles` table is the editable source of truth. Admin edits in Access Management (`updateCrmUser`, `addCrmUser`) therefore must persist to `profiles` (via REST PATCH with the anon key) — not just to local state — or changes silently revert on reload/other devices.

**Data isolation.** `fetchOperationalData` branches on category:
- admin/intern fetch *all* tables.
- clients fetch only their assigned project. A client is linked to a project via `profiles.assigned_client_id` (= the `clients.id`) **and** by stamping `clients.profile_id` with the client's user id when assigned. Both linkages exist so the client query works regardless of whether row-level security is keyed on `profile_id`.

**Local persistence layer.** `crmUsers` (provisioned accounts shown in Access Management) is mirrored to `localStorage` under `almmatix_users` and merged with DB `profiles` on load. Note the DB↔local field-name split: DB rows use snake_case (`assigned_client_id`, `allowed_tabs`) while locally-created rows use camelCase (`assignedClientId`, `allowedTabs`).

**DB ↔ TS mapping.** Supabase rows (snake_case) are converted via `mapClientToTS`, `mapCommentToTS`, etc. before entering React state. When adding a field, update both the mapper and the corresponding `update*` writer (which translates back to snake_case).

### Conventions specific to this codebase

- Components are dense and use inline Tailwind with CSS custom properties for theming (`var(--color-ember)`, `var(--color-bg)`, …) defined in `globals.css` — use these tokens, not raw colors.
- Path alias `@/*` → `src/*`.
- CRM components are `"use client"`; the marketing pages are server components by default.
