# TalePick Simplified Architecture Implementation Guide

> **Backend-Only Business Logic with Shared Types** • Next.js 16 • MongoDB • 2025

---

## 🎯 **Why Use Simplified Architecture?**

For TalePick, a simplified architecture makes sense because:

✅ **Backend-First Logic** - All business rules validated server-side for security
✅ **API-Driven Frontend** - Frontend consumes APIs, no duplicate logic
✅ **Shared Types Only** - Consistency through TypeScript interfaces
✅ **Reduced Complexity** - 3 packages instead of 6, easier to maintain
✅ **Better Performance** - Tree-shaking works, no bundle bloat

---

## 🚀 **Implementation Roadmap**

### **Phase 1: Foundation Setup (Week 1)**

#### **1.1 Create Simplified Package Structure**
```bash
# Create the simplified package structure
mkdir -p packages/{shared,backend,testing}

# Initialize packages
npm init -y -w packages/shared
npm init -y -w packages/backend
npm init -y -w packages/testing
```

#### **1.2 Setup Workspace Configuration**
```json
// root package.json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces"
  }
}

// root tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@shared/domain": ["packages/domain"],
      "@shared/application": ["packages/application"],
      "@shared/infrastructure": ["packages/infrastructure"],
      "@shared/presentation": ["packages/presentation"],
      "@shared/shared": ["packages/shared"],
      "@shared/testing": ["packages/testing"]
    }
  }
}
```

### **Phase 2: Domain Layer (Week 1-2)**

#### **2.1 Core Domain Entities**
```typescript
// packages/domain/entities/User.ts
export class User {
  constructor(private readonly data: UserData) {}

  get id(): string { return this.data.id; }
  get email(): string { return this.data.email; }
  get credits(): number { return this.data.gameStats.credits; }
  get isGuest(): boolean { return this.data.authentication.isGuest; }
  get accountStatus(): AccountStatus { return this.data.accountStatus; }

  canSpendCredits(amount: number): boolean {
    return this.data.gameStats.credits >= amount;
  }

  deductCredits(amount: number): User {
    if (!this.canSpendCredits(amount)) {
      throw new InsufficientCreditsError(this.data.gameStats.credits, amount);
    }

    return new User({
      ...this.data,
      gameStats: {
        ...this.data.gameStats,
        credits: this.data.gameStats.credits - amount
      }
    });
  }
}

// packages/domain/entities/Story.ts
export class Story {
  constructor(private readonly data: StoryData) {}

  get id(): string { return this.data.id; }
  get isPublished(): boolean { return this.data.metadata.isPublished; }
  get startingNodeId(): string { return this.data.content.startingNodeId; }

  canUserAccess(user: User): boolean {
    if (this.isPublished) return true;
    if (user.accountStatus.role?.isAdmin) return true;
    return false;
  }
}

// packages/domain/entities/Admin.ts
export class Admin {
  constructor(private readonly data: AdminData) {}

  get id(): string { return this.data.id; }
  get role(): AdminRole { return this.data.role; }
  get permissions(): string[] { return this.data.permissions; }

  hasPermission(permission: string): boolean {
    return this.data.permissions.includes(permission);
  }
}
```

#### **2.2 Domain Services**
```typescript
// packages/domain/services/CreditService.ts
export class CreditService {
  calculateRefillAmount(user: User): number {
    const maxCredits = user.gameStats.maxCredits;
    const currentCredits = user.gameStats.credits;
    return Math.min(maxCredits - currentCredits, maxCredits);
  }

  shouldRefill(user: User): boolean {
    const timeSinceLastRefill = Date.now() - user.gameStats.lastCreditRefill;
    return timeSinceLastRefill >= REFILL_INTERVAL_MS;
  }
}

// packages/domain/services/AchievementService.ts
export class AchievementService {
  checkAchievementUnlock(user: User, achievement: Achievement, context: any): boolean {
    switch (achievement.type) {
      case 'STORIES_COMPLETED':
        return user.gameStats.totalStoriesPlayed >= achievement.conditions.storiesCompleted;
      case 'CREDIT_SPENDER':
        return context.totalSpent >= achievement.conditions.creditsSpent;
      default:
        return false;
    }
  }
}
```

#### **2.3 Repository Interfaces**
```typescript
// packages/domain/repositories/IUserRepository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: UserData): Promise<User>;
  update(id: string, updates: Partial<UserData>): Promise<User>;
  save(user: User): Promise<User>;
}

// packages/domain/repositories/IStoryRepository.ts
export interface IStoryRepository {
  findById(id: string): Promise<Story | null>;
  findPublished(filters: StoryFilters): Promise<Story[]>;
  findAll(filters: StoryFilters): Promise<Story[]>;
  create(storyData: StoryData): Promise<Story>;
  update(id: string, updates: Partial<StoryData>): Promise<Story>;
  delete(id: string): Promise<void>;
}

// packages/domain/repositories/IAdminRepository.ts
export interface IAdminRepository {
  findById(id: string): Promise<Admin | null>;
  findByEmail(email: string): Promise<Admin | null>;
  create(adminData: AdminData): Promise<Admin>;
  update(id: string, updates: Partial<AdminData>): Promise<Admin>;
}
```

### **Phase 3: Infrastructure Layer (Week 2)**

#### **3.1 Database Setup**
```typescript
// packages/infrastructure/database/connection.ts
import mongoose from 'mongoose';

export class DatabaseConnection {
  private static instance: DatabaseConnection;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    if (mongoose.connection.readyState === 1) return;

    await mongoose.connect(process.env.MONGODB_URL!);
    console.log('Connected to MongoDB');
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }
}
```

#### **3.2 Repository Implementations**
```typescript
// packages/infrastructure/repositories/MongoUserRepository.ts
import { User } from '@shared/domain/entities/User';
import { IUserRepository } from '@shared/domain/repositories/IUserRepository';
import { UserSchema } from '../models/UserSchema';

export class MongoUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const userData = await UserSchema.findById(id);
    return userData ? new User(userData.toObject()) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userData = await UserSchema.findOne({ email });
    return userData ? new User(userData.toObject()) : null;
  }

  async create(userData: UserData): Promise<User> {
    const userDoc = new UserSchema(userData);
    await userDoc.save();
    return new User(userDoc.toObject());
  }

  async save(user: User): Promise<User> {
    await UserSchema.updateOne(
      { _id: user.id },
      { $set: user.getData() }
    );
    return user;
  }
}
```

#### **3.3 JWT Services**
```typescript
// packages/infrastructure/jwt/UserJWTService.ts
import jwt from 'jsonwebtoken';

export class UserJWTService {
  private readonly secret = process.env.USER_JWT_SECRET!;
  private readonly audience = 'talepick-users';

  signUser(payload: UserJWTPayload): string {
    return jwt.sign(payload, this.secret, {
      audience: this.audience,
      expiresIn: '7d'
    });
  }

  verifyUser(token: string): UserJWTPayload {
    return jwt.verify(token, this.secret, {
      audience: this.audience
    }) as UserJWTPayload;
  }
}

// packages/infrastructure/jwt/AdminJWTService.ts
export class AdminJWTService {
  private readonly secret = process.env.ADMIN_JWT_SECRET!;
  private readonly audience = 'talepick-admins';

  signAdmin(payload: AdminJWTPayload): string {
    return jwt.sign(payload, this.secret, {
      audience: this.audience,
      expiresIn: '8h'
    });
  }

  verifyAdmin(token: string): AdminJWTPayload {
    return jwt.verify(token, this.secret, {
      audience: this.audience
    }) as AdminJWTPayload;
  }
}
```

### **Phase 4: Application Layer (Week 2-3)**

#### **4.1 Use Cases - User**
```typescript
// packages/application/use-cases/auth/RegisterUserUseCase.ts
export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService,
    private otpService: IOTPService
  ) {}

  async execute(userData: RegisterUserData): Promise<AuthResult> {
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new UserEmailAlreadyExistsError(userData.email);
    }

    // Create user with email verification required
    const user = User.create({
      ...userData,
      authentication: {
        authMethod: 'email',
        isGuest: false,
        emailVerified: false,
        hasPassword: true
      }
    });

    const savedUser = await this.userRepository.save(user);

    // Send OTP verification
    const otp = await this.otpService.generateOTP(savedUser.email, 'registration');
    await this.emailService.sendVerificationEmail(savedUser.email, otp);

    return {
      success: true,
      user: savedUser,
      requiresVerification: true
    };
  }
}

// packages/application/use-cases/stories/GetPublishedStoriesUseCase.ts
export class GetPublishedStoriesUseCase {
  constructor(private storyRepository: IStoryRepository) {}

  async execute(filters: StoryFilters): Promise<PaginatedStories> {
    const { page = 1, limit = 20, genre, search } = filters;
    const skip = (page - 1) * limit;

    const stories = await this.storyRepository.findPublished({
      genre,
      search,
      skip,
      limit
    });

    const total = await this.storyRepository.countPublished({
      genre,
      search
    });

    return {
      stories: stories.map(story => ({
        id: story.id,
        title: story.title,
        description: story.description,
        coverImage: story.media.coverImageUrl,
        rating: story.stats.averageRating,
        totalPlayers: story.stats.totalPlayers,
        duration: story.metadata.estimatedDuration,
        isNew: story.isNew()
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

// packages/application/use-cases/credits/SpendCreditsUseCase.ts
export class SpendCreditsUseCase {
  constructor(
    private userRepository: IUserRepository,
    private creditTransactionRepository: ICreditTransactionRepository
  ) {}

  async execute(userId: string, amount: number, context: string): Promise<CreditResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundError(userId);

    const userWithDeduction = user.deductCredits(amount);

    // Record transaction
    await this.creditTransactionRepository.create({
      userId: user.id,
      transactionType: 'spend',
      source: context,
      amount: -amount,
      balanceBefore: user.credits,
      balanceAfter: userWithDeduction.credits,
      description: `Spent ${amount} credits on ${context}`
    });

    await this.userRepository.save(userWithDeduction);

    return {
      success: true,
      creditsRemaining: userWithDeduction.credits,
      creditsSpent: amount
    };
  }
}
```

#### **4.2 Use Cases - Admin**
```typescript
// packages/application/use-cases-admin/auth/AdminLoginUseCase.ts
export class AdminLoginUseCase {
  constructor(
    private adminRepository: IAdminRepository,
    private adminJWTService: AdminJWTService,
    private adminAuditService: IAdminAuditService
  ) {}

  async execute(credentials: AdminCredentials): Promise<AdminAuthResult> {
    const admin = await this.adminRepository.findByEmail(credentials.email);
    if (!admin) throw new AdminNotFoundError();

    const isValid = await this.validateAdminCredentials(admin, credentials);
    if (!isValid) throw new InvalidCredentialsError();

    if (admin.accountStatus.status !== 'active') {
      throw new AdminAccountInactiveError(admin.accountStatus.status);
    }

    const token = this.adminJWTService.signAdmin({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions
    });

    // Log admin login
    await this.adminAuditService.log({
      adminId: admin.id,
      action: 'LOGIN',
      details: { ip: credentials.ip }
    });

    return {
      success: true,
      admin,
      token
    };
  }
}

// packages/application/use-cases-admin/users/SuspendUserUseCase.ts
export class SuspendUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private adminAuditService: IAdminAuditService
  ) {}

  async execute(
    adminId: string,
    userId: string,
    reason: string,
    durationDays?: number
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundError(userId);

    const suspensionEndsAt = durationDays
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
      : null;

    const suspendedUser = new User({
      ...user.getData(),
      accountStatus: {
        status: 'suspended',
        reason,
        moderatedBy: adminId,
        moderatedAt: new Date(),
        suspensionEndsAt
      }
    });

    const savedUser = await this.userRepository.save(suspendedUser);

    // Log suspension
    await this.adminAuditService.log({
      adminId,
      action: 'SUSPEND_USER',
      targetId: userId,
      details: { reason, durationDays }
    });

    return savedUser;
  }
}
```

### **Phase 5: Presentation Layer (Week 3)**

#### **5.1 Controllers - User**
```typescript
// packages/presentation/controllers/auth/RegisterUserController.ts
export class RegisterUserController {
  constructor(private registerUserUseCase: RegisterUserUseCase) {}

  async handle(request: Request): Promise<NextResponse> {
    try {
      const userData = await request.json();
      const result = await this.registerUserUseCase.execute(userData);

      return NextResponse.json({
        success: true,
        message: 'Registration successful. Please check your email for verification.',
        requiresVerification: result.requiresVerification,
        user: this.serializeUser(result.user)
      }, { status: 201 });

    } catch (error) {
      if (error instanceof UserEmailAlreadyExistsError) {
        return NextResponse.json({
          success: false,
          error: 'EMAIL_ALREADY_EXISTS',
          message: 'Email already registered'
        }, { status: 409 });
      }

      console.error('Registration error:', error);
      return NextResponse.json({
        success: false,
        error: 'REGISTRATION_FAILED',
        message: 'Registration failed'
      }, { status: 500 });
    }
  }

  private serializeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      profile: user.profile,
      gameStats: user.gameStats
    };
  }
}
```

#### **5.2 Controllers - Admin**
```typescript
// packages/presentation/controllers-admin/users/SuspendUserController.ts
export class SuspendUserController {
  constructor(private suspendUserUseCase: SuspendUserUseCase) {}

  async handle(request: Request, context: { adminId: string }): Promise<NextResponse> {
    try {
      const { userId, reason, durationDays } = await request.json();

      const result = await this.suspendUserUseCase.execute(
        context.adminId,
        userId,
        reason,
        durationDays
      );

      return NextResponse.json({
        success: true,
        message: 'User suspended successfully',
        user: this.serializeUser(result)
      });

    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return NextResponse.json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        }, { status: 404 });
      }

      console.error('Suspension error:', error);
      return NextResponse.json({
        success: false,
        error: 'SUSPENSION_FAILED',
        message: 'Failed to suspend user'
      }, { status: 500 });
    }
  }

  private serializeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      accountStatus: user.accountStatus
    };
  }
}
```

### **Phase 6: Next.js API Routes (Week 3)**

#### **6.1 User API Routes**
```typescript
// apps/frontend/api/auth/register/route.ts
import { RegisterUserController } from '@shared/presentation/controllers/auth/RegisterUserController';
import { container } from '../../../di-container';

export async function POST(request: Request) {
  const controller = container.get(RegisterUserController);
  return controller.handle(request);
}

// apps/frontend/api/stories/route.ts
import { GetPublishedStoriesController } from '@shared/presentation/controllers/stories/GetPublishedStoriesController';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
    genre: searchParams.get('genre'),
    search: searchParams.get('search')
  };

  const controller = new GetPublishedStoriesController();
  return controller.handle(filters);
}
```

#### **6.2 Admin API Routes**
```typescript
// apps/admin/api/auth/login/route.ts
import { AdminLoginController } from '@shared/presentation/controllers-admin/auth/AdminLoginController';

export async function POST(request: Request) {
  const controller = new AdminLoginController();
  return controller.handle(request);
}

// apps/admin/api/users/[id]/suspend/route.ts
import { SuspendUserController } from '@shared/presentation/controllers-admin/users/SuspendUserController';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  // Admin authentication handled by middleware
  const adminId = request.headers.get('x-admin-id')!;
  const controller = new SuspendUserController();

  return controller.handle(request, { adminId, userId: params.id });
}
```

### **Phase 7: Dependency Injection (Week 3)**

#### **7.1 Container Setup**
```typescript
// apps/frontend/di-container.ts
import { container } from 'tsyringe';
import { RegisterUserController } from '@shared/presentation/controllers/auth/RegisterUserController';
import { RegisterUserUseCase } from '@shared/application/use-cases/auth/RegisterUserUseCase';
import { MongoUserRepository } from '@shared/infrastructure/repositories/MongoUserRepository';
import { NodeMailerEmailService } from '@shared/infrastructure/email/NodeMailerEmailService';

container.register('MongoUserRepository', MongoUserRepository);
container.register('EmailService', NodeMailerEmailService);
container.register('RegisterUserUseCase', RegisterUserUseCase);
container.register('RegisterUserController', RegisterUserController);

export { container };
```

#### **7.2 Admin Container**
```typescript
// apps/admin/di-container.ts
import { container } from 'tsyringe';
import { AdminLoginController } from '@shared/presentation/controllers-admin/auth/AdminLoginController';
import { AdminLoginUseCase } from '@shared/application/use-cases-admin/auth/AdminLoginUseCase';
import { MongoAdminRepository } from '@shared/infrastructure/repositories/MongoAdminRepository';

container.register('MongoAdminRepository', MongoAdminRepository);
container.register('AdminLoginUseCase', AdminLoginUseCase);
container.register('AdminLoginController', AdminLoginController);

export { container };
```

---

## 🎯 **Implementation Priority**

### **Week 1: Foundation**
1. Set up package structure
2. Create domain entities (User, Story, Admin)
3. Set up database connection

### **Week 2: Core Logic**
1. Implement infrastructure layer (repositories, JWT)
2. Create essential use cases (auth, stories)
3. Set up dependency injection

### **Week 3: API Layer**
1. Create presentation controllers
2. Set up Next.js API routes
3. Implement middleware for authentication

### **Week 4+: Features**
1. Implement remaining use cases
2. Add admin functionality
3. Set up testing

This approach gives you a **solid foundation** that can grow with your project while maintaining clean architecture principles! 🚀