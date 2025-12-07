# Repository Guidelines

## Project Structure & Module Organization
- Root `package.json` uses npm workspaces; active apps live under `apps/*`.
- `apps/frontend` and `apps/admin` are Next.js 16 App Router projects (ports 3000 and 3001). Pages/layout live in `app/`, shared styles in `app/globals.css`, static assets in `public/`.
- `legacy/*` contains older copies of each app; avoid new work there unless migrating content forward.

## Build, Test, and Development Commands
- `npm install` – installs all workspace dependencies.
- `npm run dev` – runs both apps in watch mode; use `npm run dev -w frontend` or `-w admin` for a single target.
- `npm run build` – production build for all workspaces; prefer `-w <app>` when iterating.
- `npm run lint` – ESLint across workspaces; run `npm run lint -w frontend` before submitting UI changes.

## Coding Style & Naming Conventions
- Language: TypeScript with `strict` mode. Prefer functional React components.
- Indentation: 2 spaces; keep files ASCII. Use path alias `@/*` inside each app.
- Components: PascalCase (`NavBar.tsx`); hooks/utilities: camelCase; Next app routes: lowercase folder names.
- Styling: Tailwind CSS 4 is available; keep tokens co-located with components or `app/globals.css`. Avoid inline magic values—extract to constants when reused.
- Linting: Next.js ESLint config is authoritative; resolve warnings proactively instead of ignoring rules.

## Testing Guidelines
- No test harness is configured yet; add tests when introducing behavior. Prefer React Testing Library or Playwright; name files `*.test.tsx` and keep near the feature or in `__tests__/`.
- Cover success and failure states for data fetching, and at least one interaction per UI flow. Document any gaps in the PR.

## Commit & Pull Request Guidelines
- Existing history uses short, imperative messages (e.g., `Fix admin README...`). Follow that style; scope prefixes are optional but keep the first word imperative.
- PRs should include: concise summary, linked issue/ticket, test or lint output, and screenshots/GIFs for visual changes (frontends on 3000/3001).
- Keep changes within `apps/*` unless intentionally touching legacy; call this out in the PR if so.

## Security & Configuration Tips
- Never commit secrets. Use `.env.local` files per app; prefix client-side values with `NEXT_PUBLIC_`.
- Before deploying or sharing bundles, run `npm run build` and `npm run lint` for the target app to catch misconfigured environment variables early.
