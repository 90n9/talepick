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

## Tech Stack

- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **ESLint** - Code linting

