# Repository Guidelines

## Project Structure & Module Organization
- This project uses **Clean Architecture** with complete layer separation. See `@FOLDER_STRUCTURE.md` for detailed structure.
- Root `package.json` uses npm workspaces; active apps live under `apps/*`.
- `apps/frontend` and `apps/admin` are Next.js 16 App Router apps (ports 3000/3001).
- `mock/*` holds mock React versions; reference while migrating features, design, layout, and copy into the Next.js apps.

## Clean Architecture Implementation
- **Domain Layer**: Core business logic in `src/domain/` (entities, repositories interfaces, services)
- **Application Layer**: Use cases in `src/application/` (user stories, business operations)
- **Infrastructure Layer**: External concerns in `src/infrastructure/` (database, auth, external APIs)
- **Presentation Layer**: Controllers and API routes in `src/presentation/` and Next.js `app/api/`
- Complete separation of user and admin systems for security (different JWT keys, collections)
- Database schema and relations are documented in `@docs/database/` (24 collections)

## Architecture & Shared Logic
- Monorepo with Next.js API routes (no separate backend service)
- Shared business logic lives in `packages/shared/` with proper Clean Architecture layers
- Use dependency injection with `tsyringe` for loose coupling
- Deploy frontend/admin on separate subdomains; keep subdomain-specific config in env files, not code.

## Build, Test, and Development Commands
- `npm install` – installs all workspace dependencies.
- `npm run dev` – runs both apps in watch mode; use `npm run dev -w frontend` or `-w admin` for a single target.
- `npm run build` – production build for all workspaces; prefer `-w <app>` when iterating.
- `npm run lint` – ESLint across workspaces; run `npm run lint -w frontend` or `-w admin` before submitting UI changes.

## Coding Style & Naming Conventions
- TypeScript with `strict` mode; functional React components by default.
- 2-space indentation; keep files ASCII. Use `@/*` paths inside each app.
- Components PascalCase (`NavBar.tsx`); hooks/utilities camelCase; routes lowercase folders.
- Tailwind CSS 4; keep shared tokens in `app/globals.css` or co-located files. Fix lint warnings instead of disabling rules.
- Follow Clean Architecture naming: Entities (`*.entity.ts`), Use Cases (`*.use-case.ts`), Repositories (`*.repository.ts`)

## Testing Guidelines
- Testing follows 80/15/5 pyramid: Unit > Integration > E2E
- Unit tests for entities, use cases, and utilities in `src/**/*.test.ts` (80%)
- Integration tests for repositories and API endpoints in `src/**/*.integration.test.ts` (15%)
- E2E tests for critical user journeys in `__tests__/*.e2e.test.tsx` with Playwright (5%)
- Use dependency injection to mock external dependencies in tests
- Cover success/failure paths and business rule validations; note any gaps in the PR.

## Commit & Pull Request Guidelines
- Use short, imperative messages (e.g., `Fix admin README...`); scope prefixes optional.
- PRs include summary, linked issue/ticket, test or lint output, and screenshots/GIFs for visual changes (frontends on ports 3000/3001).
- Keep changes in `apps/*` or shared packages; call out any legacy edits explicitly.

## Security & Configuration Tips
- Never commit secrets. Use `.env.local` per app; client-readable values must be prefixed `NEXT_PUBLIC_`. Document required Mongo connection vars in PRs.
- Before deploying, run `npm run build` and `npm run lint` for the target app to catch env or bundling issues early.
