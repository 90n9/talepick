# MongoDB Collection Naming Convention

This document defines the standard naming convention for all MongoDB collections in the TalePick project using Mongoose ODM.

## 🎯 Key Rule

**Two or more words = Use `lowercase_with_underscores`**

- ✅ `user_achievements` (readable)
- ❌ `userachievements` (hard to read)
- ❌ `UserAchievements` (wrong format)

**Single word = Use Mongoose auto-generation**

- ✅ `User` → `users` (auto-generated)
- ✅ `Story` → `stories` (auto-generated)

## Mongoose Naming Conventions

### Standard Mongoose Pattern
Mongoose follows JavaScript conventions with automatic collection name generation:

- **Model Names**: PascalCase singular form (e.g., `User`, `Story`, `AdminAccount`)
- **Collection Names**: Mongoose automatically converts model names to lowercase plural (e.g., `User` → `users`)
- **Schema Fields**: camelCase (e.g., `firstName`, `createdAt`, `lastLoginAt`)

### Collection Name Generation

Mongoose automatically generates collection names using these rules:
1. Convert model name to lowercase
2. Make plural (usually by adding 's' or 'es')
3. Use for MongoDB collection name

```javascript
// Model Definition - Mongoose handles collection naming
const UserSchema = new Schema<IUser>(userSchemaFields, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Mongoose automatically maps:
// Model: User → Collection: users
export default mongoose.model<IUser>('User', UserSchema);

// Model: AdminAccount → Collection: adminaccounts
export default mongoose.model<IAdminAccount>('AdminAccount', AdminAccountSchema);
```

## TalePick Collection Standards

### Model Naming Rules

1. **Use PascalCase singular form**: `User`, `Story`, `AdminAccount`, `UserAchievement` (NOT `UserAchievements`)
2. **Be descriptive**: Use clear, meaningful names
3. **Follow JavaScript class naming conventions**

### Collection Naming Rules

1. **Single-word collections**: Use Mongoose auto-generation (e.g., `User` → `users`)
2. **Multi-word collections**: MUST use `lowercase_with_underscores` format:
   - `UserAchievements` → `user_achievements`
   - `AdminAccount` → `admin_accounts`
   - `CreditTransaction` → `credit_transactions`
   - `StoryNode` → `story_nodes`

### Field Naming Rules

1. **Use camelCase**: `firstName`, `createdAt`, `lastLoginAt`
2. **Be descriptive**: `creditBalance`, `storyCompletionDate`
3. **Use standard prefixes**: `is*` for booleans, `has*` for flags

### Special Cases: Two-Word Collection Names

**Rule**: Any collection name with two or more words MUST use `lowercase_with_underscores` format.

**Important**: Model names are ALWAYS singular, collection names are ALWAYS plural.

For compound words where Mongoose auto-pluralization creates awkward names, manually specify collection names:

```javascript
// Model name: UserAchievement (singular)
// Auto-generated collection: userachievements (hard to read)
// ✅ Correct: Use underscores for readability
const UserAchievementSchema = new Schema<IUserAchievement>(fields, {
  timestamps: true,
  collection: 'user_achievements',  // Two words = use underscores
});

export default mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);

// More examples (Model → Collection):
// UserAchievement → user_achievements (not userachievements)
// AdminAccount → admin_accounts (not adminaccounts)
// StoryNode → story_nodes (not storynodes)
// CreditTransaction → credit_transactions (not credittransactions)
// UserStoryProgress → user_story_progress (not userstoryprogresses)
```

**Key Pattern**:
- **Model File**: `UserAchievement.ts` (singular)
- **Model Class**: `UserAchievement` (singular)
- **Collection**: `user_achievements` (plural, with underscores)

## Implementation Guidelines

### 1. Standard Model Definition

```javascript
// ✅ Correct - Let Mongoose handle collection naming
const StorySchema = new Schema<IStory>(storyFields, {
  timestamps: true,
  toJSON: { virtuals: true },
});

export default mongoose.model<IStory>('Story', StorySchema);
// Results in collection: 'stories'

// ✅ Field naming in camelCase
const UserSchema = new Schema({
  firstName: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
  creditBalance: { type: Number, default: 0 }
});
```

### 2. Special Cases with Manual Collection Names

**Two-Word Collection Names**: Always use `lowercase_with_underscores`

```javascript
// ❌ Auto-generated: adminaccounts (hard to read)
// ❌ Manual: AdminAccounts (wrong format)
// ✅ Correct: admin_accounts (readable, follows convention)

const AdminAccountSchema = new Schema<IAdminAccount>(fields, {
  collection: 'admin_accounts'  // Two words = use underscores
});

export default mongoose.model<IAdminAccount>('AdminAccount', AdminAccountSchema);

// More examples:
const UserStoryProgressSchema = new Schema(fields, {
  collection: 'user_story_progress'  // Three words = use underscores
});

const CreditTransactionSchema = new Schema(fields, {
  collection: 'credit_transactions'  // Two words = use underscores
});
```

### 3. Aggregation Pipelines

```javascript
// Reference the actual collection name (auto-generated or manual)
{
  $lookup: {
    from: 'user_achievements',  // Actual collection name
    localField: '_id',
    foreignField: 'userId',
    as: 'achievements',
  },
}
```

## TalePick Collection Mappings

### Single-Word Collections (Auto-Generated)
| Model Name | Final Collection | Notes |
|------------|------------------|-------|
| User | users | Auto-generated ✅ |
| Story | stories | Auto-generated ✅ |
| Review | reviews | Auto-generated ✅ |
| Achievement | achievements | Auto-generated ✅ |
| Avatar | avatars | Auto-generated ✅ |
| Genre | genres | Auto-generated ✅ |
| Analytics | analytics | Auto-generated ✅ |

### Multi-Word Collections (Manual Override with underscores)
| Model Name | Auto-Generated | Final Collection | Rule Applied |
|------------|---------------|------------------|-------------|
| **UserAchievement** | userachievements | `user_achievements` | Two words = underscores |
| **UserAvatar** | useravatars | `user_avatars` | Two words = underscores |
| **UserFavorite** | userfavorites | `user_favorites` | Two words = underscores |
| **UserStoryProgress** | userstoryprogresses | `user_story_progress` | Three words = underscores |
| **UserSession** | usersessions | `user_sessions` | Two words = underscores |
| **AdminAccount** | adminaccounts | `admin_accounts` | Two words = underscores |
| **AdminLog** | adminlogs | `admin_logs` | Two words = underscores |
| **AdminLoginHistory** | adminloginhistories | `admin_login_history` | Three words = underscores |
| **SecurityEvent** | securityevents | `security_events` | Two words = underscores |
| **StoryAsset** | storyassets | `story_assets` | Two words = underscores |
| **StoryGallery** | storygalleries | `story_gallery` | Two words = underscores |
| **StoryNode** | storynodes | `story_nodes` | Two words = underscores |
| **ReviewFlag** | reviewflags | `review_flags` | Two words = underscores |
| **ReviewVote** | reviewvotes | `review_votes` | Two words = underscores |
| **StoryFlag** | storyflags | `story_flags` | Two words = underscores |
| **SystemConfig** | systemconfigs | `system_config` | Two words = underscores |
| **CreditTransaction** | credittransactions | `credit_transactions` | Two words = underscores |
| **OtpCode** | otpcodes | `otp_codes` | Two words = underscores |

**Key Rule**: Any collection name with two or more words MUST use `lowercase_with_underscores` format for readability.

## Migration Guidelines

When updating existing collections:

1. **Update Model Schema**: Change the `collection` property in the schema definition
2. **Update $lookup Stages**: Update all aggregation pipeline `$lookup` operations
3. **Database Migration**: Create a migration script to rename collections in MongoDB
4. **Update Documentation**: Update all references in documentation

### Migration Script Example

```javascript
// Example migration script to rename collections
const oldToNew = {
  AdminAccount: 'admin_accounts',
  UserFavorite: 'user_favorites',
  StoryFlag: 'story_flags',
  // Add all mappings...
};

for (const [oldName, newName] of Object.entries(oldToNew)) {
  try {
    await db.collection(oldName).rename(newName);
    console.log(`Renamed ${oldName} to ${newName}`);
  } catch (error) {
    console.log(`Collection ${oldName} may not exist or already renamed`);
  }
}
```

## Code Review Checklist

When reviewing code that involves MongoDB collections:

- [ ] Collection name uses `lowercase_with_underscores` format
- [ ] Collection name is plural
- [ ] Schema specifies the collection name explicitly
- [ ] `$lookup` stages reference the exact collection name
- [ ] No hardcoded collection names that don't match schemas
- [ ] New collections follow the naming convention

## Benefits

1. **Consistency**: All collections follow the same pattern
2. **Readability**: Underscore-separated names are easy to read
3. **Tooling**: Better compatibility with database tools
4. **Case Sensitivity**: Avoids case-sensitivity issues across different systems
5. **Cross-Platform**: Consistent behavior across Windows, macOS, and Linux

## Enforcement

- **CI/CD Pipeline**: Automated linting checks for collection names
- **Code Review**: Manual verification during pull requests
- **Documentation**: This document serves as the source of truth

---

**Last Updated**: 2025-12-12
**Version**: 1.0
**Applies to**: All MongoDB collections in TalePick project
