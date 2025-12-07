# talepick

TalePick - A monorepo project with Next.js TypeScript applications

## Project Structure

This is a monorepo managed with npm workspaces containing:

- **apps/frontend** - Frontend Next.js application (runs on port 3000)
- **apps/admin** - Admin Next.js application (runs on port 3001)

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

Install dependencies for all apps:

```bash
npm install
```

### Development

Run all apps in development mode:

```bash
npm run dev
```

Run a specific app:

```bash
# Frontend (http://localhost:3000)
npm run dev -w frontend

# Admin (http://localhost:3001)
npm run dev -w admin
```

### Build

Build all apps:

```bash
npm run build
```

Build a specific app:

```bash
npm run build -w frontend
npm run build -w admin
```

### Linting

Lint all apps:

```bash
npm run lint
```

Lint a specific app:

```bash
npm run lint -w frontend
npm run lint -w admin
```

## Local MongoDB (Docker)

Start a local Mongo instance for backend or integration testing:

```bash
docker compose up -d mongo
```

Stop it when finished:

```bash
docker compose down
```

The default credentials are `root` / `example` on `mongodb://localhost:27017`. Use `.env.local` per app to point to this URL when needed.

## Testing

- Frontend/Admin: Run lint to catch most issues before committing:
  ```bash
  npm run lint -w frontend
  npm run lint -w admin
  ```
  Add component or integration tests (e.g., React Testing Library/Playwright) alongside features as they are introduced.
- Backend: The backend service is not ported yet; when added, run its test script (e.g., `npm test -w <backend>`) with Mongo running via `docker compose up -d mongo`.

## Tech Stack

- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **ESLint** - Code linting
