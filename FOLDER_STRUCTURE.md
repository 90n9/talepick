# TalePick Folder Structure Design

> **Next.js 16 Monorepo** • Clean Architecture • Shared API Layer • MongoDB • 2025

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

    C --> C1[domain/]
    C --> C2[application/]
    C --> C3[infrastructure/]
    C --> C4[presentation/]
    C --> C5[shared/]
    C --> C6[testing/]

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e9
    style D fill:#fff3e0
    style E fill:#fce4ec
```

---

## 🏗️ Clean Architecture Overview

```mermaid
graph TB
    subgraph "Presentation Layer"
        PA[Frontend App<br/>Next.js]
        PB[Admin App<br/>Next.js]
    end

    subgraph "Packages - Presentation"
        PC[API Controllers]
        PD[API Middleware]
        PE[DTOs]
    end

    subgraph "Packages - Application"
        PF[Use Cases]
        PG[App Services]
        PH[Interfaces]
    end

    subgraph "Packages - Domain"
        PI[Entities]
        PJ[Value Objects]
        PK[Repository Interfaces]
        PL[Domain Services]
    end

    subgraph "Packages - Infrastructure"
        PM[Database]
        PN[External APIs]
        PO[Email]
        PP[Storage]
    end

    PA --> PC
    PB --> PC
    PC --> PF
    PF --> PI
    PK --> PM

    style PA fill:#ffcdd2
    style PB fill:#c8e6c9
    style PI fill:#fff9c4
    style PM fill:#d1c4e9
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
    C11 --> C11b[admin/]

    style A fill:#fce4ec
```

---

## 📦 Clean Architecture Packages

### Domain Layer (`/packages/domain/`)

```mermaid
graph TD
    A[packages/domain/] --> B[entities/]
    A --> C[value-objects/]
    A --> D[repositories/]
    A --> E[services/]
    A --> F[events/]
    A --> G[errors/]
    A --> H[types/]

    B --> B1[User.ts]
    B --> B2[Story.ts]
    B --> B3[StoryNode.ts]
    B --> B4[Achievement.ts]
    B --> B5[Review.ts]

    D --> D1[IUserRepository.ts]
    D --> D2[IStoryRepository.ts]
    D --> D3[IAchievementRepository.ts]

    style A fill:#fff9c4
```

### Application Layer (`/packages/application/`)

```mermaid
graph TD
    A[packages/application/] --> B[use-cases/]
    A --> C[use-cases-admin/]
    A --> D[services/]
    A --> E[dto/]
    A --> F[validators/]
    A --> G[interfaces/]

    B --> B1[auth/]
    B --> B2[users/]
    B --> B3[stories/]
    B --> B4[achievements/]
    B --> B5[reviews/]
    B --> B6[credits/]

    C --> C1[auth/]
    C --> C2[users/]
    C --> C3[stories/]
    C --> C4[analytics/]
    C --> C5[content/]

    style A fill:#c8e6c9
```

### Infrastructure Layer (`/packages/infrastructure/`)

```mermaid
graph TD
    A[packages/infrastructure/] --> B[database/]
    A --> C[email/]
    A --> D[storage/]
    A --> E[external/]
    A --> F[cache/]
    A --> G[logging/]

    B --> B1[connection/]
    B --> B2[repositories/]
    B --> B3[models/]
    B --> B4[seeds/]

    B2 --> B2a[MongoUserRepository.ts]
    B2 --> B2b[MongoStoryRepository.ts]
    B2 --> B2c[MongoAchievementRepository.ts]

    style A fill:#d1c4e9
```

### Presentation Layer (`/packages/presentation/`)

```mermaid
graph TD
    A[packages/presentation/] --> B[controllers/]
    A --> C[controllers-admin/]
    A --> D[middleware/]
    A --> E[serializers/]
    A --> F[routes/]
    A --> G[types/]

    B --> B1[auth/]
    B --> B2[users/]
    B --> B3[stories/]
    B --> B4[achievements/]

    C --> C1[auth/]
    C --> C2[users/]
    C --> C3[stories/]
    C --> C4[analytics/]

    D --> D1[user/]
    D --> D2[admin/]
    D --> D3[shared/]

    style A fill:#ffcdd2
```

### Shared Layer (`/packages/shared/`)

```mermaid
graph TD
    A[packages/shared/] --> B[types/]
    A --> C[utils/]
    A --> D[constants/]
    A --> E[config/]
    A --> F[enums/]

    B --> B1[api.types.ts]
    B --> B2[common.types.ts]
    B --> B3[environment.types.ts]

    C --> C1[date.ts]
    C --> C2[string.ts]
    C --> C3[validation.ts]
    C --> C4[crypto.ts]

    style A fill:#e0f2f1
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
        B2[api/admin/]
        B3[api/users/]
        B4[api/stories/]
    end

    A1 --> A1a[register/route.ts]
    A1 --> A1b[login/route.ts]
    A1 --> A1c[verify-otp/route.ts]

    A3 --> A3a[route.ts]
    A3 --> A3b[id/route.ts]
    A3 --> A3c[id/play/route.ts]

    B2 --> B2a[users/route.ts]
    B2 --> B2b[stories/route.ts]
    B2 --> B2c[analytics/route.ts]

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
# Create packages structure
mkdir -p packages/{domain,application,infrastructure,presentation,shared,testing}

# Add package.json files
npm init -y -w packages/domain
npm init -y -w packages/application
# ... etc

# Configure TypeScript paths
# Create initial domain entities
```

### Phase 2: Development Setup (Week 1)

```bash
# Install dependencies
npm install mongoose @types/mongoose -w packages/infrastructure
npm install jsonwebtoken @types/jsonwebtoken -w packages/infrastructure
npm install zod -w packages/application

# Set up database connection
# Create basic middleware
```

### Phase 3: Feature Development (Week 2+)

```bash
# Add models incrementally
# Add use cases as needed
# Implement controllers
# Add API routes
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
      "@shared/domain": ["packages/domain"],
      "@shared/application": ["packages/application"],
      "@shared/infrastructure": ["packages/infrastructure"],
      "@shared/presentation": ["packages/presentation"],
      "@shared/shared": ["packages/shared"]
    }
  }
}
```

---

*This simplified structure supports phased development while maintaining flexibility for growth, with comprehensive testing and security at every layer.*