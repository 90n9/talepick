# TalePick Milestone 1.3: User Authentication API Implementation Plan

> Next.js 16 Monorepo | Clean Architecture | MongoDB | Mailgun Email | 2025

## 1. Milestone Overview

**Objective**: Implement the user-facing authentication API (frontend app) with email-based signup + OTP verification, login/logout, Google OAuth login, and guest sessions.

**Roadmap Source**: `PROJECT_ROADMAP.md` -> Phase 1 (Week 2) -> **Milestone 1.3: User Authentication API**

**Milestone 1.3 Tasks (from roadmap)**:
- [ ] Implement user registration API with email validation
- [ ] Create OTP verification API endpoints
- [ ] Implement login/logout API routes
- [ ] Add Google OAuth integration
- [ ] Create guest session API system
- [ ] Set up shared authentication utilities

**Email Provider**: Mailgun HTTP API (no SMTP) for OTP and verification emails.

**Out of Scope (explicitly)**:
- Admin authentication (see `PROJECT_ROADMAP.md` Milestone 3.1)
- Full JWT middleware + session/device management policies (Milestone 1.4 focuses on JWT middleware, lockout, and tracking)

---

## 2. Current State (Repo Assessment)

**Already in place**
- Database models exist for core auth data:
  - `packages/backend/src/infrastructure/models/User.ts` (password hashing, emailVerified, authMethod, guest flags)
  - `packages/backend/src/infrastructure/models/OtpCode.ts` (registration/password_reset/login_verification OTPs + rate limit helpers)
  - `packages/backend/src/infrastructure/models/UserSession.ts` (device/session tracking, TTL expiry)
- API foundation utilities exist:
  - Standard `ApiResponse` / `ApiError` serializers
  - Middleware composition (`withMiddleware`) + rate limiting + validation utilities
  - Health endpoints exist in both apps (`/api/health`)
- API contract is documented:
  - User API spec: `docs/api/frontend/README.md` (auth endpoints + DTOs)

**Missing**
- No user auth controllers/use-cases in `@talepick/backend` yet
- No user auth API routes under `apps/frontend/app/api/auth/*` yet
- No Mailgun integration / email sending abstraction
- No token issuing / refresh strategy implemented

---

## 3. API Endpoints to Deliver (Frontend App)

Target: Implement these endpoints under `apps/frontend/app/api/auth/*` (Node runtime, not Edge).

**Primary endpoints (align to `docs/api/frontend/README.md`)**
- `POST /api/auth/signup`
- `POST /api/auth/signup/verify-otp`
- `POST /api/auth/signup/resend-otp`
- `POST /api/auth/login`
- `POST /api/auth/login/google`
- `POST /api/auth/guest`
- `POST /api/auth/refresh`

**Roadmap-required endpoint (not currently in the frontend API spec)**
- `POST /api/auth/logout` (invalidate refresh token / session)

**OTP email sending**
- Signup OTP: `OtpCode.type = "registration"`
- Password reset OTP support exists in the API spec; implement if time allows (recommended because Mailgun + OTP plumbing is shared):
  - `POST /api/auth/password/forgot`
  - `POST /api/auth/password/verify-otp`
  - `POST /api/auth/password/reset`

---

## 4. Key Design Decisions

### 4.1 Token + Session Strategy (Milestone 1.3)

Implement a pragmatic, production-friendly approach that supports device tracking later:

- **Access token**: short-lived JWT signed with the *frontend app's* `JWT_SECRET` (kept separate from admin by per-app `.env.local`).
- **Refresh token**: opaque random token stored as `UserSession.sessionToken` (prefer storing a hash of the token; raw token returned only once).
- **Rotation**: `POST /api/auth/refresh` rotates refresh token (invalidate old session token, issue new one) and issues a fresh access token.
- **Logout**: invalidates the current refresh token / session.

This aligns with:
- Roadmap: "Session Management: JWT tokens with device tracking"
- Existing schema: `user_sessions` already exists with device info and TTL expiry

### 4.2 OTP Strategy

- Use `OtpCode` model to create and validate OTPs.
- Enforce:
  - per-route rate limiting (existing `rateLimitConfigs.auth`)
  - per-email OTP issuance caps (`OtpCode.checkRateLimit`)
  - resend cooldown (app-level: e.g., 60s; stored/derived from last OTP createdAt)
- Mark OTP as used on success (`OtpCode.markAsUsed`) and invalidate older OTPs (`invalidatePreviousOtps`).

### 4.3 Mailgun Email Delivery

- Use Mailgun HTTP API via `fetch()` (no extra dependency required).
- Keep Mailgun credentials server-only (no `NEXT_PUBLIC_*`).
- Provide a dev/test fallback:
  - if Mailgun config is missing, do not hard-fail in development; log a safe message and return a deterministic success response only when explicitly enabled (feature flag), otherwise return `SERVICE_UNAVAILABLE`.
  - never log OTP code in production logs.

---

## 5. Implementation Tasks (Clean Architecture)

### Task 1: Environment + Configuration (Auth + Mailgun)

**Goals**
- Add server-only env parsing for auth + mailgun
- Keep frontend/admin secrets separate via per-app `.env.local`

**Files to modify / create**
- Modify: `packages/backend/src/infrastructure/config/env.ts`
- Modify: `packages/backend/src/infrastructure/config/types.ts`
- Add: `packages/backend/src/infrastructure/config/auth.ts`
- Add: `packages/backend/src/infrastructure/config/mailgun.ts`
- Modify: `.env.example`
- Modify: `apps/frontend/.env.local` (add Mailgun + auth token settings)

**Proposed env vars**
- Mailgun:
  - `MAILGUN_API_KEY`
  - `MAILGUN_DOMAIN`
  - `MAILGUN_FROM_EMAIL` (e.g. `no-reply@talepick.com`)
  - `MAILGUN_FROM_NAME` (e.g. `TalePick`)
  - `MAILGUN_BASE_URL` (optional; default `https://api.mailgun.net`)
- Auth:
  - `AUTH_ACCESS_TOKEN_EXPIRES_IN` (e.g. `15m`)
  - `AUTH_REFRESH_TOKEN_EXPIRES_IN_DAYS` (e.g. `7`)
  - `AUTH_OTP_EXPIRES_IN_MINUTES` (e.g. `10`)
  - `AUTH_OTP_RESEND_COOLDOWN_SECONDS` (e.g. `60`)

### Task 2: Domain Interfaces (Auth Boundaries)

**Goals**
- Keep business logic in use-cases, decouple from Mongoose + Mailgun

**Files to add**
- `packages/backend/src/domain/repositories/IOtpCodeRepository.ts`
- `packages/backend/src/domain/repositories/IUserSessionRepository.ts`
- `packages/backend/src/domain/services/IEmailService.ts`
- `packages/backend/src/domain/services/ITokenService.ts`
- (Optional) `packages/backend/src/domain/services/IGoogleTokenVerifier.ts`

**Notes**
- `IUserRepository` exists; extend it only if needed (avoid bloating a single interface).
- Keep admin/user separation: these are *user auth* interfaces only.

### Task 3: Application Use Cases (User Auth)

**Files to add (suggested naming)**
- `packages/backend/src/application/use-cases/auth/StartSignup.use-case.ts`
- `packages/backend/src/application/use-cases/auth/VerifySignupOtp.use-case.ts`
- `packages/backend/src/application/use-cases/auth/ResendSignupOtp.use-case.ts`
- `packages/backend/src/application/use-cases/auth/Login.use-case.ts`
- `packages/backend/src/application/use-cases/auth/LoginWithGoogle.use-case.ts`
- `packages/backend/src/application/use-cases/auth/LoginAsGuest.use-case.ts`
- `packages/backend/src/application/use-cases/auth/RefreshSession.use-case.ts`
- `packages/backend/src/application/use-cases/auth/Logout.use-case.ts`

**Core flows**
- **Signup**: validate input -> check `User` uniqueness (email/username) -> create OTP (type `registration`) -> send OTP email via Mailgun -> return `AuthOtpIssued`.
- **Verify signup OTP**: validate OTP -> create verified email user -> create session -> issue tokens -> return `AuthSession`.
- **Resend OTP**: enforce cooldown + rate limits -> rotate OTP -> send email -> return `AuthOtpIssued`.
- **Login**: verify credentials -> enforce `emailVerified` -> create session -> issue tokens -> return `AuthSession`.
- **Google login**: verify `idToken` -> upsert/link user (`authentication.googleId`) -> create session -> return `AuthSession`.
- **Guest**: create guest user (or reuse existing guest session if provided) -> create session -> return `AuthSession`.
- **Refresh**: validate refresh token/session -> rotate session token -> issue new access token (+ refresh token) -> return tokens.
- **Logout**: invalidate session token (and optionally all sessions for the user later).

**Error mapping**
- Use `ErrorCode` from `packages/backend/src/presentation/serializers/apiError.ts`:
  - `VALIDATION_ERROR`, `CONFLICT`, `INVALID_CREDENTIALS`, `ACCOUNT_NOT_VERIFIED`, `ACCOUNT_DISABLED`, `RATE_LIMIT_EXCEEDED`, `TOKEN_INVALID`, `TOKEN_EXPIRED`, `SERVICE_UNAVAILABLE`

### Task 4: Infrastructure Implementations

**Repositories (Mongoose-backed)**
- Add: `packages/backend/src/infrastructure/repositories/OtpCodeRepository.ts`
- Add: `packages/backend/src/infrastructure/repositories/UserSessionRepository.ts`
- Add/Modify: `packages/backend/src/infrastructure/repositories/UserRepository.ts` (if it doesn't exist yet; implement `IUserRepository`)

**Token service**
- Add: `packages/backend/src/infrastructure/services/JwtTokenService.ts`
  - `signAccessToken(userId, sessionId, expiresIn)`
  - `signRefreshToken()` (opaque) or `generateOpaqueToken()` helper
  - `verifyAccessToken()` (used later by Milestone 1.4 middleware, but can be included now for completeness)

**Mailgun email service**
- Add: `packages/backend/src/infrastructure/services/MailgunEmailService.ts`
  - Sends OTP email via Mailgun `/v3/<domain>/messages`
  - Support text + HTML bodies
  - Uses `Authorization: Basic base64("api:<MAILGUN_API_KEY>")`
  - Timeouts + sane error messages (never leak Mailgun response bodies to client)

**Google token verifier**
- Add: `packages/backend/src/infrastructure/services/GoogleIdTokenVerifier.ts`
  - Verify `idToken` audience matches `GOOGLE_CLIENT_ID`
  - Extract `sub` (googleId), `email`, `name`, `picture`
  - Prefer a library approach (e.g. `google-auth-library`) or JOSE verification; avoid `tokeninfo` in production due to latency/rate limits

### Task 5: Presentation Layer (Controllers + Next.js Route Handlers)

**Controllers**
- Add: `packages/backend/src/presentation/controllers/UserAuthController.ts`
  - Extends `BaseController`
  - Calls use cases and returns `ApiResponse` envelopes

**API routes (frontend app)**
- Add:
  - `apps/frontend/app/api/auth/signup/route.ts`
  - `apps/frontend/app/api/auth/signup/verify-otp/route.ts`
  - `apps/frontend/app/api/auth/signup/resend-otp/route.ts`
  - `apps/frontend/app/api/auth/login/route.ts`
  - `apps/frontend/app/api/auth/login/google/route.ts`
  - `apps/frontend/app/api/auth/guest/route.ts`
  - `apps/frontend/app/api/auth/refresh/route.ts`
  - `apps/frontend/app/api/auth/logout/route.ts`

**Route handler requirements**
- `export const runtime = 'nodejs'` (Mailgun + Mongoose)
- `export const dynamic = 'force-dynamic'` (avoid caching)
- Use strict middleware config for auth endpoints:
  - `createStrictHandler` (rate limiting + logging redaction)
  - Update `validationConfigs` in `packages/backend/src/presentation/middleware/validation.middleware.ts` to match `docs/api/frontend/README.md`

### Task 6: Shared Types and Utilities

**Goals**
- Avoid duplicating DTO shapes and auth helpers across apps

**Shared package additions**
- Add: `packages/shared/src/types/auth.ts` (Auth DTOs: requests/responses/tokens/session)
- Add: `packages/shared/src/utils/auth.ts` (optional: helpers like token storage key names)

**Backend utilities**
- Add: `packages/backend/src/infrastructure/utils/requestInfo.ts`
  - `getClientIp(request)`
  - `getUserAgent(request)`
  - `inferPlatformAndBrowser(userAgent)`

### Task 7: Testing Strategy (Recommended Minimum)

**Unit tests (use-cases)**
- Create tests for:
  - OTP issuance + resend cooldown + rate limiting behavior (mock repository + email service)
  - Login success/failure (wrong password, unverified email, locked/banned)
  - Refresh rotation logic

**Integration tests (API handlers)**
- Basic integration tests that construct `NextRequest` objects and call route handlers directly.
- Mock Mailgun + Google verification.

---

## 6. Implementation Order (Suggested)

1. Config + env variables (auth + mailgun)
2. Domain interfaces + infrastructure implementations (repos/services)
3. Core use-cases (signup/login/guest) + controllers
4. Next.js API routes (frontend) wired with middleware + validation
5. Refresh + logout
6. Optional password reset endpoints (reuse OTP + Mailgun)
7. Tests + documentation alignment

---

## 7. Success Criteria

- User can:
  - request signup OTP (Mailgun email delivered) and verify OTP to create account
  - login via email/password (requires verified email)
  - login via Google `idToken`
  - start a guest session
  - refresh tokens and logout (session invalidated)
- All auth endpoints:
  - run on Node runtime
  - return standardized `ApiResponse` / `ApiError`
  - enforce rate limiting and input validation
- Mailgun credentials are server-only and documented in `.env.example`

---

## 8. Open Questions / Decisions to Confirm

1. Should refresh tokens be delivered in JSON (per current frontend API spec) or as `HttpOnly` cookies (recommended for browser security)?
2. Should unverified users be created immediately (emailVerified=false) or only after OTP verify (spec currently says "create user only after OTP verification")?
3. Guest account policy:
   - one guest account per device (cookie-based) vs a new guest user each time
4. Google login account linking:
   - allow linking Google to an existing email/password account with matching email, or require explicit linking flow?
