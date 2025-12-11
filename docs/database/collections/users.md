# Users Collection

**Purpose**: Central user authentication and profile management

## Schema

```javascript
{
  _id: ObjectId,
  email: String,              // unique, indexed
  username: String,           // unique, indexed
  passwordHash: String,       // bcrypt hash (optional for OAuth)

  // Profile Information
  profile: {
    displayName: String,
    avatar: {
      type: String,           // 'default' | 'custom' | 'google'
      value: String           // URL or avatar ID
    },
    bio: String,
    profileImageUrl: String   // from Google profile
  },

  // Authentication Methods
  authentication: {
    authMethod: String,       // 'email' | 'google' | 'guest'
    isGuest: Boolean,
    googleId: String,         // for OAuth, unique indexed
    emailVerified: Boolean,
    hasPassword: Boolean
  },

  // Account Management
  accountStatus: {
    status: String,           // 'active' | 'suspended' | 'banned' | 'under_review' | 'locked'
    reason: String,
    moderatedBy: ObjectId,
    moderatedAt: Date,
    suspensionEndsAt: Date,
    lockType: String,         // 'manual' | 'auto_security' | 'auto_fraud'
    lockExpiresAt: Date
  },

  // Game Statistics
  gameStats: {
    credits: Number,
    maxCredits: Number,
    lastCreditRefill: Date,
    totalStoriesPlayed: Number,
    totalEndingsUnlocked: Number,
    totalAvatarsUnlocked: Number,  // denormalized count from UserAvatars

    currentAvatarId: String,
    createdAt: Date,
    lastLoginAt: Date
  },

  // Soft Delete Support
  deletedAt: Date,
  deletedBy: ObjectId,
  deleteReason: String
}
```

## Key Indexes

- `email` (unique)
- `username` (unique)
- `authentication.googleId` (unique, sparse)
- `accountStatus.status`
- `deletedAt` (sparse)

## Query Examples

```javascript
// Get user by email with active status
db.Users.findOne({
  email: "user@example.com",
  "accountStatus.status": "active",
  deletedAt: null
});

// Get user's game statistics
db.Users.findOne(
  { _id: ObjectId("user_id") },
  {
    "profile.displayName": 1,
    "profile.avatar": 1,
    "gameStats": 1,
    "accountStatus.status": 1
  }
);

// Find users with specific avatar
db.Users.find({
  "gameStats.currentAvatarId": "avatar_123"
}).select({
  "profile.displayName": 1,
  "gameStats.currentAvatarId": 1
});

// Update credits after refill
db.Users.updateOne(
  {
    _id: ObjectId("user_id"),
    "gameStats.credits": { $lt: 100 }
  },
  {
    $set: {
      "gameStats.credits": 100,
      "gameStats.lastCreditRefill": new Date()
    }
  }
);

// Get users with low credits for notifications
db.Users.find({
  "gameStats.credits": { $lt: 20 },
  "accountStatus.status": "active",
  "authentication.emailVerified": true
});

// Soft delete user
db.Users.updateOne(
  { _id: ObjectId("user_id") },
  {
    $set: {
      deletedAt: new Date(),
      deletedBy: ObjectId("admin_id"),
      deleteReason: "User request"
    }
  }
);
```

## Account Status Management

| Status | Who Initiates | Duration | Use Case |
|--------|---------------|----------|----------|
| **active** | System | Permanent | Normal users |
| **suspended** | Admin | Temporary | First offenses |
| **banned** | Admin | Permanent | Severe violations |
| **under_review** | System | Temporary | Suspicious activity |
| **locked** | System | Temporary | Auto-security |

## Authentication Support

### Multiple Auth Methods
- **Email**: Traditional email/password with OTP verification
- **Google**: OAuth2 integration with profile sync
- **Guest**: Temporary accounts with limited features

### Password Security
- bcrypt hashing with salt rounds
- Optional for OAuth users
- Password reset via OTP flow

## Game Statistics Denormalization

The `gameStats` field includes denormalized counts for performance:
- `totalAvatarsUnlocked`: Updated via triggers or application logic
- `totalStoriesPlayed`: Incremented on story completion
- `totalEndingsUnlocked`: Tracked for achievements

## Privacy & Compliance

- Email addresses are unique and indexed
- Google OAuth profile data stored separately
- Soft delete maintains audit trail
- PII fields are encrypted at rest (application-level)