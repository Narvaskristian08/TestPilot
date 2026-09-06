# TestPilot implementation guide

## Project context

TestPilot (also branded as NOIR QA Automation in the current UI) is a web QA platform. A user submits a deployed website URL; the backend queues Playwright-based checks and returns test results, screenshots, traces, and live progress updates.

The repository is a split application:

- `frontend/`: React 18 + TypeScript + Vite + TailwindCSS + React Router.
- `backend/`: Node.js + Express + TypeScript, Supabase-backed hosted persistence with a SQLite/local-artifact development fallback, Playwright workers, and Socket.IO.
- `supabase/`: version-controlled Postgres migrations and Storage configuration for the hosted beta.
- `tests/` and `pages/`: Playwright regression tests and page objects for the application.

The primary product surface is the NOIR dashboard in `frontend/src/pages/NoirDashboard.tsx`. Supporting dashboard pages, test-run detail views, auth pages, usage tracking, artifact views, and local-first management pages are implemented in the same React application.

The local development targets documented by the project are:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## Current progress snapshot (2026-09-06)

### Implemented

- Core URL-driven QA run creation and history APIs.
- Playwright checks for availability, page load, links, buttons, forms, responsive layouts, console/network errors, accessibility, screenshots, and security checks.
- In-memory queue with cancellation and Socket.IO progress events.
- NOIR dark dashboard with live stats, recent runs, failures, charts, quick actions, and a new-run modal.
- Test-run detail page with live progress, result summaries, artifacts, cancel, and delete actions.
- Routes/pages for test runs, suites, cases, schedules, environments, reports, artifacts, settings, profile, login, and registration.
- Supabase auth integration, backend ownership checks, and API rate limiting; QA-run caps are opt-in.
- Frontend and backend production builds now pass after restoring the dashboard data wiring and async model calls.
- NOIR Developer Console theme refactor applied across the public landing page, dashboard shell, management pages, auth/profile screens, test-run views, progress states, result cards, tables, modals, and usage surfaces.
- Neutral palette is centralized in `frontend/tailwind.config.js` and `frontend/src/index.css`; status colors are reserved for passed, failed, warning, and running states.
- Publication wiring now includes a Vercel SPA rewrite, a Render backend blueprint, environment-driven API/WebSocket URLs, aligned Socket.IO subscriptions, and private Supabase artifact storage configuration.
- Local-first management workflows now use real API-backed CRUD for suites, cases, schedules, environments, reports, and artifact browsing. These routes use the existing SQLite fallback when Supabase is absent and remain ownership-scoped when hosted Supabase is enabled.
- Reports aggregate persisted test runs and can be downloaded as JSON. Artifact downloads continue through the existing ownership-checked test-run route.
- QA-run usage limits are opt-in (`ENABLE_USAGE_LIMITS=true`); local development is unlimited by default. API rate limiting, URL validation, SSRF protection, and ownership checks remain enabled.

### Verified caveats

- The working tree began with substantial pre-existing edits, new documentation, migrations, and generated artifacts. The release work is being prepared on the `codex/noir-theme-refactor` branch; do not reset, checkout, or delete unrelated work.
- The repository documentation is ahead of the checked source in a few places. The baseline builds exposed TypeScript issues in legacy components, optional fields, progress event typing, the Supabase no-credentials path, and backend Promise handling. Those blockers are now fixed for the current source; treat passing builds and actual runtime behavior as the source of truth.
- The current dashboard was previously mounted at `/`. The landing-page implementation moves it to `/dashboard`, keeps test-run detail routes intact, and makes `/` the public entry point.
- The frontend can load without Supabase client variables. When backend Supabase variables are absent, local guest runs are unlimited and use SQLite/local artifact files; hosted persistence, artifact storage, and email/password authentication require `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

## Development rules

1. Preserve the existing frontend/backend split, package managers, lockfiles, API response shapes, and route behavior unless a requested product change requires a deliberate route update.
2. Keep new UI code in `frontend/src` and use the existing React/TypeScript/Tailwind conventions. Prefer the installed Heroicons components and shared CSS tokens over new image assets or hand-authored SVG illustrations.
3. Keep `/` public and marketing-oriented. Dashboard navigation, test-run pages, auth redirects, and internal links must use `/dashboard` when they mean the NOIR dashboard.
4. Preserve guest testing and authenticated testing flows. Do not move optional usage enforcement into the client or store secrets in frontend source.
5. Keep target URL validation strict to `http:` and `https:`. Continue relying on backend SSRF protection for requests initiated by the test runner.
6. Use realistic product copy and data. Avoid claiming that scheduler execution or unverified third-party integrations are live; the current schedule feature persists configuration and exposes toggles, while execution requires a scheduler worker.
7. Do not overwrite or remove user-owned work in the dirty working tree. Make focused, additive edits and inspect diffs before handing off.
8. Validate frontend changes with `npm run build` from `frontend/`. If the change affects the backend, run its available typecheck/build as well. Record unresolved validation issues explicitly.
9. For routing changes, smoke-check that `/`, `/dashboard`, `/login`, `/register`, and `/test/:id` still resolve without a blocking runtime error when their dependencies are available.

## Implementation plan

### Phase 1 — Establish the public entry point

- Add a polished NOIR landing page with product-specific messaging, navigation, feature/value sections, workflow explanation, and clear calls to action.
- Add a URL-first CTA that validates a target and forwards it to `/dashboard` with a prefilled new-test modal.
- Keep a direct “Open dashboard” path for returning users.

### Phase 2 — Separate landing and dashboard routing

- Mount the landing page at `/` and the existing dashboard at `/dashboard`.
- Update sidebar, auth, profile, and test-run return links so internal navigation does not loop back to the landing page.
- Preserve `/classic` and existing test detail URLs for backward compatibility.

### Phase 3 — Restore a green frontend baseline

- Make missing frontend Supabase configuration safe at import time; fail backend startup clearly when production persistence or artifact storage credentials are missing.
- Fix existing TypeScript mismatches around optional run/result fields, progress events, and status badge values.
- Keep these fixes narrowly scoped to existing behavior; do not redesign the legacy dashboard.

### Phase 4 — Validate and hand off

- Run the frontend production build.
- Inspect the final diff for accidental edits to the pre-existing worktree.
- Report the current product status, the new route structure, validation results, and any remaining backend/runtime prerequisites.

### Phase 5 — NOIR Developer Console visual system

- Replace the generic SaaS visual language with the NOIR monochrome palette and restrained surface hierarchy.
- Keep primary actions near-white, secondary actions bordered and dark, and status colors semantic rather than decorative.
- Reduce panel/button radius, remove gradients, blobs, glass effects, and heavy shadows, and keep motion limited to existing loading/feedback states.
- Refactor shared layout, metric, table, status, modal, progress, and result components first so the visual system propagates across existing routes.
- Restyle the public landing page to introduce the product before the dashboard while preserving the URL-to-dashboard handoff and all existing links/forms.
- Validate the frontend build and verify that both `/` and `/dashboard?target=...` are served by the local app.

### Phase 6 — Local-first product completion

- Deploy the Vite frontend from `frontend/` to Vercel with SPA rewrites and production API, Socket.IO, and Supabase environment variables.
- Run the Express/Socket.IO/Playwright backend as a single Render web service with Chromium installed and `/health` enabled.
- Persist screenshots and traces in the private `test-artifacts` Supabase Storage bucket while retaining local temporary-file support for development.
- Apply Supabase migrations and storage configuration through the GitHub workflow using repository secrets; never commit credentials.
- Replace placeholder management data with local/hosted API-backed CRUD and preserve existing response shapes for test runs and artifacts.
- Keep the single-instance scheduler boundary explicit until a worker/queue can execute suites with a configured target environment.
- Verify API rate limits, CORS, WebSocket progress, artifact access, URL safety, cancellation, deletion, management ownership, and local persistence before merging to `main`. QA-run caps are only verified when explicitly enabled.

## Definition of done

- A visitor landing on `/` sees the TestPilot value proposition and can start or open the dashboard.
- `/dashboard` renders the existing NOIR dashboard and can accept a URL forwarded from the landing page.
- Internal links and auth redirects point to the dashboard rather than the landing page.
- Missing frontend Supabase variables do not block the landing page or local guest flow; the hosted beta flow requires backend Supabase credentials.
- The UI uses the NOIR Developer Console visual system consistently across public, authenticated, management, and test-result surfaces.
- `frontend/npm run build` passes, or any remaining failure is documented with its exact source and reason.
- The frontend can be deployed from `frontend/` to Vercel and the backend can be deployed from `backend/` to Render using the documented environment variables.
- Supabase migrations and the private `test-artifacts` bucket are managed from version-controlled configuration.
- A production smoke test confirms the complete URL → queued test → live progress → results/artifacts flow.
- A local smoke test confirms SQLite health plus suite, case, schedule, environment, report, and artifact-management endpoints without hosted credentials.
