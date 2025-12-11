# Frontend Migration Plan (mock/frontend → apps/frontend)

Goal: move the Vite React app in `mock/frontend` into the Next.js App Router app in `apps/frontend`, keeping design, layout, copy and functionality while ensuring `npm run lint -w frontend`, `npm run build -w frontend`, and new tests pass at every stage.

## Working notes
- Commands: run from repo root; use workspace flags (`-w frontend`).
- Organize shared logic under `apps/frontend/app/lib` or `app/ui` before promoting to a shared workspace package if admin also needs it.
- Confirm current state with `npm run lint -w frontend` and `npm run build -w frontend`.
- Prefer files ≤200 lines; split components if longer (tests can exceed 200 if needed).

## Tasks
- [x] T01 Baseline: install deps if needed (`npm install`), confirm `npm run lint -w frontend` and `npm run build -w frontend` (webpack flag needed here).
- [x] T02 Inventory mock app: list routes, components, services, constants, types, env needs from `mock/frontend` (pages/components/services/constants/types/metadata/env keys).
- [x] T03 Decide Next folder map: define `app/lib` (constants/types/services), `app/ui` (shared UI), route segments; note any files to split to keep <200 lines.
- [x] T04 Align TS/eslint config: add path aliases in `apps/frontend/tsconfig.json`, confirm eslint covers `app/lib` and `app/ui`, rerun lint.
- [x] T05 Copy constants/types: migrate `constants.ts` → `app/lib/constants.ts`, `types.ts` → `app/lib/types.ts`; ensure exports are modular; lint.
- [x] T06 Service wrapper: move `services/geminiService.ts` → `app/lib/geminiService.ts` (or API route if server-only), handle env (`NEXT_PUBLIC_` for client), add minimal test; lint.
- [x] T07 Route scaffold batch 1: Home, Stories (list), Stories `[id]`, Play `[id]` with placeholder components; build check.
- [x] T08 Route scaffold batch 2: Login, Signup, ForgotPassword, Profile with placeholders; build check.
- [x] T09 Route scaffold batch 3: Support, PrivacyPolicy, TermsOfUse, Oracle with placeholders; build check.
- [x] T10 Layout shell: port `components/Layout.tsx` to `app/layout.tsx` + shared layout pieces; wire metadata from `metadata.json`; ensure globals loaded; build.
- [x] T11 Auth layout: port `components/AuthLayout.tsx` (client) to `app/ui/AuthLayout.tsx` and integrate in auth routes; lint.
- [x] T12 UI component StoryCard: migrate to `app/ui/StoryCard.tsx` (split helper subcomponents if >200 lines); add unit test; lint/test.
- [x] T13 UI components modals batch 1: RatingModal → `app/ui/modals/RatingModal.tsx` (split logic/hooks if needed); add test for open/submit paths; lint/test.
- [x] T14 UI components modals batch 2: ReportModal, EditProfileModal in `app/ui/modals/*` (split form pieces if needed); add smoke tests; lint/test.
- [x] T15 Page logic Home: replace placeholder with mock content; ensure data/hooks client/server boundaries; lint/build.
- [x] T16 Page logic Library: port logic; ensure pagination/filtering if present; lint/build.
- [x] T17 Page logic StoryDetail: port logic, hook services, modals; ensure loading/error states; add interaction test; lint/build.
- [x] T18 Page logic Player: port logic, media controls; add interaction test; lint/build.
- [x] T19 Auth pages batch: Login, Signup, ForgotPassword flows; connect to auth logic/context; add tests for success/error paths; lint/build.
- [x] T20 Profile page: port profile view/edit; reuse EditProfileModal; test save/error; lint/build.
- [x] T21 Static/support pages: Support, PrivacyPolicy, TermsOfUse, Oracle content and metadata; lint/build.
- [x] T22 Auth/data wiring: centralize auth/user state (context or server actions), ensure hooks are client and services are shared; add unit/integration tests; lint/build.
- [x] T23 Final cleanup: remove unused imports, keep files <200 lines by extracting helpers, align CSS/tokens in `app/globals.css`, update `apps/frontend/README.md` with run commands/env requirements, final `npm run lint -w frontend`, `npm run build -w frontend`, and tests.

## Notes
- T01 baseline: `npm run lint -w frontend` passes; `npm run build -w frontend` needs `--webpack` in this environment (Turbopack fails with “binding to a port” permission error).
- T02 inventory:
  - Routes: Home, Library, StoryDetail, Player, Login, Signup, ForgotPassword, Profile, Support, PrivacyPolicy, TermsOfUse, Oracle.
  - Components: Layout, AuthLayout, StoryCard, RatingModal, ReportModal, EditProfileModal.
  - Shared: `constants.ts` (mock data/achievements/app info), `types.ts`, `services/geminiService.ts`, `metadata.json`, `App.tsx`, `index.tsx`.
  - Env: `GEMINI_API_KEY` (placeholder) from `.env.local`.
- T03 folder map (Next):
  - `app/lib`: constants, types, service wrappers; split helpers if approaching 200 lines.
  - `app/ui`: shared UI; modals in `app/ui/modals`; extract subcomponents to stay under 200 lines.
  - Routes: `app/(routes)/home`, `stories`, `stories/[id]`, `play/[id]`, `auth/login`, `auth/signup`, `auth/forgot-password`, `profile`, `support`, `privacy-policy`, `terms-of-use`, `oracle`.
  - Layouts: global shell in `app/layout.tsx` + `app/ui/LayoutShell`; auth layout in `app/ui/AuthLayout`.
- Current homepage mirrors mock Home: dark parallax hero with video/image overlay, Thai copy/CTAs, featured stories grid, how-to-play steps, reviews slider, and support CTA using mock fonts (Kanit/Inter, Noto Serif Thai/Cinzel).
