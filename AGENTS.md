# Repository Guidelines

## Project Structure & Module Organization
- Root `package.json` uses npm workspaces; active apps live under `apps/*`.
- `apps/frontend` and `apps/admin` are Next.js 16 App Router apps (ports 3000/3001). Layout and routes live in `app/`, shared styles in `app/globals.css`, static assets in `public/`.
- `legacy/*` holds mock React versions; reference only while migrating features into the Next.js apps.

## Architecture & Shared Logic
- Monorepo is for the web game; frontend and admin should share business logic and Mongo-backed models.
- Start shared code in `app/lib/*` inside one app; when both need it, promote to a workspace package (e.g., `packages/shared` or `apps/shared` with its own `package.json`) and import via workspace.
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

## Testing Guidelines
- No harness yet; add tests with new behavior. Prefer React Testing Library or Playwright; name files `*.test.tsx` near features or in `__tests__/`.
- Cover success/failure paths and at least one interaction per UI flow; note any gaps in the PR.

## Commit & Pull Request Guidelines
- Use short, imperative messages (e.g., `Fix admin README...`); scope prefixes optional.
- PRs include summary, linked issue/ticket, test or lint output, and screenshots/GIFs for visual changes (frontends on ports 3000/3001).
- Keep changes in `apps/*` or shared packages; call out any legacy edits explicitly.

## Security & Configuration Tips
- Never commit secrets. Use `.env.local` per app; client-readable values must be prefixed `NEXT_PUBLIC_`. Document required Mongo connection vars in PRs.
- Before deploying, run `npm run build` and `npm run lint` for the target app to catch env or bundling issues early.
