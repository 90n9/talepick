# TalePick Folder Structure Design

> **Next.js 16 Monorepo** • Simplified Clean Architecture • Backend-Only Logic • MongoDB • 2025

---

## 📁 Root Directory Structure

```mermaid
graph TD
    A[talepick/] --> B[apps/]
    A --> C[packages/]
    A --> D[docs/]
    A --> E[scripts/]
    A --> F[.github/]
    A --> G[tools/]

    B --> B1[frontend/ - Port 3000]
    B --> B2[admin/ - Port 3001]

    C --> C1[shared/]
    C --> C2[backend/]
    C --> C3[testing/]

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e9
    style D fill:#fff3e0
    style E fill:#fce4ec
```

---

## 🏗️ Simplified Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Apps"
        PA[Frontend App<br/>Next.js Port 3000]
        PB[Admin App<br/>Next.js Port 3001]
    end

    subgraph "Backend Package"
        PC[Domain Layer<br/>Entities & Rules]
        PD[Application Layer<br/>Use Cases]
        PE[Infrastructure Layer<br/>Database & APIs]
        PF[Presentation Layer<br/>API Controllers]
    end

    subgraph "Shared Package"
        PG[Types & Interfaces]
        PH[Constants & Utils]
        PI[Enums & Helpers]
    end

    PA --> PE
    PB --> PE
    PC --> PD
    PD --> PE
    PE --> PF
    PC --> PG

    style PA fill:#ffcdd2
    style PB fill:#c8e6c9
    style PC fill:#fff9c4
    style PE fill:#d1c4e9
    style PG fill:#e0f2f1
```

---

## 📂 Apps Structure

### Frontend App (`/apps/frontend/`)

```mermaid
graph LR
    A[apps/frontend/] --> B[public/]
    A --> C[app/]
    A --> D[test/]

    C --> C1[layout.tsx]
    C --> C2[page.tsx]
    C --> C3[(auth)/]
    C --> C4[(story)/]
    C --> C5[lib/]
    C --> C6[ui/]
    C --> C7[api/]

    C3 --> C3a[login/]
    C3 --> C3b[signup/]
    C3 --> C3c[forgot-password/]

    C4 --> C4a[library/]
    C4 --> C4b[play/]

    C7 --> C7a[auth/]
    C7 --> C7b[stories/]
    C7 --> C7c[users/]

    style A fill:#e3f2fd
```

### Admin App (`/apps/admin/`)

```mermaid
graph LR
    A[apps/admin/] --> B[public/]
    A --> C[app/]
    A --> D[test/]

    C --> C1[layout.tsx]
    C --> C2[page.tsx]
    C --> C3[(auth)/]
    C --> C4[dashboard/]
    C --> C5[users/]
    C --> C6[stories/]
    C --> C7[reviews/]
    C --> C8[analytics/]
    C --> C9[lib/]
	    C --> C10[ui/]
	    C --> C11[api/]

	    C11 --> C11a[auth/]
	    C11 --> C11b[users/]
	    C11 --> C11c[stories/]
	    C11 --> C11d[analytics/]

	    style A fill:#fce4ec
```

---

## 📦 Simplified Package Structure

### Backend Package (`/packages/backend/`) - All Business Logic

```mermaid
graph TD
    A[packages/backend/] --> B[src/]
    B --> B1[domain/]
    B --> B2[application/]
    B --> B3[infrastructure/]
    B --> B4[presentation/]

    B1 --> B1a[entities/]
    B1 --> B1b[services/]
    B1 --> B1c[repositories/]

    B2 --> B2a[use-cases/]
    B2 --> B2b[services/]
    B2 --> B2c[dto/]

    B3 --> B3a[database/]
    B3 --> B3b[repositories/]
    B3 --> B3c[external/]

    B4 --> B4a[controllers/]
    B4 --> B4b[middleware/]
    B4 --> B4c[serializers/]

    style A fill:#d1c4e9
```

### Shared Package (`/packages/shared/`) - Types & Utilities

```mermaid
graph TD
    A[packages/shared/] --> B[src/]
    B --> B1[types/]
    B --> B2[constants/]
    B --> B3[utils/]
    B --> B4[enums/]

    B1 --> B1a[user.ts]
    B1 --> B1b[story.ts]
    B1 --> B1c[achievement.ts]

    B2 --> B2a[credits.ts]
    B2 --> B2b[app.ts]

    B3 --> B3a[date.ts]
    B3 --> B3b[string.ts]

    style A fill:#e0f2f1
```

### Testing Package (`/packages/testing/`)

```mermaid
graph TD
    A[packages/testing/] --> B[src/]
    B --> B1[mocks/]
    B --> B2[factories/]
    B --> B3[utils/]

    B1 --> B1a[repositories/]
    B2 --> B2a[user.ts]
    B2 --> B2b[story.ts]

    style A fill:#f3e5f5
```

---

## 🔧 Next.js API Architecture

### API Routes Structure

```mermaid
graph LR
    subgraph "Frontend API (Port 3000)"
        A1[api/auth/]
        A2[api/users/]
        A3[api/stories/]
    end

	    subgraph "Admin API (Port 3001)"
	        B1[api/auth/]
	        B2[api/users/]
	        B3[api/stories/]
	        B4[api/analytics/]
	    end

    A1 --> A1a[register/route.ts]
    A1 --> A1b[login/route.ts]
    A1 --> A1c[verify-otp/route.ts]

	    A3 --> A3a[route.ts]
	    A3 --> A3b[id/route.ts]
	    A3 --> A3c[id/play/route.ts]

	    B1 --> B1a[login/route.ts]
	    B1 --> B1b[refresh/route.ts]

	    B2 --> B2a[route.ts]
	    B2 --> B2b[id/suspend/route.ts]

	    B3 --> B3a[route.ts]
	    B3 --> B3b[id/publish/route.ts]

	    B4 --> B4a[dashboard/route.ts]

	    style A1 fill:#e1f5fe
	    style B1 fill:#fce4ec
```

### Middleware Implementation

```mermaid
graph TD
    A[Next.js Request] --> B{API Route?}
    B -->|Yes| C[Auth Middleware]
    B -->|No| D[Next Page]

    C --> E{Valid Token?}
    E -->|Yes| F[Controller]
    E -->|No| G[401 Response]

    F --> H[Use Case]
    H --> I[Repository]
    I --> J[Database]

    C --> C1[user-auth.middleware.ts]
    C --> C2[admin-auth.middleware.ts]

    style A fill:#e1f5fe
    style C fill:#fff9c4
    style F fill:#c8e6c9
    style J fill:#d1c4e9
```

---

## 🔒 Security Architecture

### Separate User & Admin Systems

```mermaid
graph TB
    subgraph "User System"
        U1[User JWT]
        U2[User Controllers]
        U3[User Use Cases]
        U4[User Data Only]
    end

    subgraph "Admin System"
        A1[Admin JWT]
        A2[Admin Controllers]
        A3[Admin Use Cases]
        A4[Full Access]
    end

    U1 -.->|Cannot Access| A2
    A1 -.->|Cannot Access| U2

    style U1 fill:#e3f2fd
    style A1 fill:#fce4ec
    style U4 fill:#ffcdd2
    style A4 fill:#c8e6c9
```

### Benefits of Complete Separation

✅ **Attack Surface Isolation** - Separate JWT keys prevent token reuse
✅ **Permission Boundaries** - No accidental privilege escalation
✅ **Audit & Compliance** - Separate trails for users and admins
✅ **Independent Scaling** - Systems can scale differently
✅ **Testing Isolation** - Independent test suites

---

## 🧪 Testing Strategy

### Testing Pyramid

```mermaid
graph TD
    A[E2E Tests<br/>5%<br/>Critical User Journeys] --> B[Integration Tests<br/>15%<br/>API + Database]
    B --> C[Unit Tests<br/>80%<br/>Domain Logic, Use Cases]

    style A fill:#ffcdd2
    style B fill:#fff9c4
    style C fill:#c8e6c9
```

### Test Structure

```mermaid
graph LR
    A[Testing Layer] --> B[Mock Repositories]
    A --> C[Test Factories]
    A --> D[Database Utils]
    A --> E[Request Helpers]

    B --> B1[MockUserRepository]
    B --> B2[MockStoryRepository]

    C --> C1[UserFactory]
    C --> C2[StoryFactory]

    style A fill:#e0f2f1
```

---

## 📋 Implementation Steps

### Phase 1: Core Structure (Week 1)

```bash
# Create simplified packages structure
mkdir -p packages/{shared,backend,testing}

# Add package.json files
npm init -y -w packages/shared
npm init -y -w packages/backend
npm init -y -w packages/testing

# Configure TypeScript paths
# Create shared types and constants
```

### Phase 2: Development Setup (Week 1)

```bash
# Install dependencies
npm install zod -w packages/shared
npm install mongoose jsonwebtoken bcryptjs -w packages/backend
npm install vitest @testing-library/react -w packages/testing

# Set up database connection in backend package
# Create initial domain entities
# Set up basic API controllers
```

### Phase 3: Feature Development (Week 2+)

```bash
# Add use cases incrementally
# Implement repositories in backend
# Add API routes in apps
# Create test utilities
```

---

## 🎯 Benefits

### ✅ Code Reuse
- Shared business logic across apps
- Single source of truth for models
- Consistent authentication and validation

### ✅ Scalability
- Easy to add new packages
- Clear separation of concerns
- Parallel team development

### ✅ Maintainability
- Centralized type definitions
- Consistent patterns
- Easy to update shared logic

### ✅ Development Speed
- Reusable components
- Clear boundaries
- Fast iteration

---

## 🔧 Configuration Examples

### Root package.json
```json
{
  "name": "talepick",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "npm run dev --workspaces",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces"
  }
}
```

### TypeScript Path Aliases
```json
{
  "compilerOptions": {
    "paths": {
      "@talepick/shared": ["packages/shared"],
      "@talepick/backend": ["packages/backend"],
      "@talepick/testing": ["packages/testing"]
    }
  }
}
```

### Package Dependencies Example
```json
// packages/shared/package.json
{
  "name": "@talepick/shared",
  "main": "dist/index.js",
  "dependencies": {
    "zod": "^4.1.13"
  }
}

// packages/backend/package.json
{
  "name": "@talepick/backend",
  "main": "dist/index.js",
  "dependencies": {
    "@talepick/shared": "workspace:*",
    "mongoose": "^8.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3"
  }
}

// apps/frontend/package.json
{
  "dependencies": {
    "@talepick/shared": "workspace:*",
    "@talepick/testing": "workspace:*"
  }
}
```

---

*This simplified structure reduces complexity while maintaining clean architecture principles. Business logic stays in the backend, frontend consumes APIs, and shared types ensure consistency across the entire application.*
