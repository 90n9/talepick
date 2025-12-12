# AdminAccounts Collection

## Purpose

Administrator account management with OAuth support and role-based permissions for TalePick platform administration.

## Mongoose Model Reference
- **Model File**: `AdminAccount.ts` (singular)
- **Model Class**: `AdminAccount` (singular)
- **Collection**: `admin_accounts` (plural, with underscores for readability)

## Schema

```javascript
{
  _id: ObjectId,
  username: String,           // unique admin username
  email: String,             // admin email address
  passwordHash: String,      // bcrypt hash (optional for Google SSO users)

  // Authentication Methods
  authentication: {
    authMethod: String,       // 'email' | 'google' | 'both'
    googleId: String,         // for Google OAuth, unique indexed
    googleEmail: String,      // Google account email
    googleProfile: {
      displayName: String,
      profileImageUrl: String,
      locale: String
    },
    hasPassword: Boolean,
    lastPasswordChange: Date
  },

  // Permissions and Access
  role: String,               // 'Super Admin' | 'Story Editor' | 'User Manager' | 'Achievement Manager'
  permissions: [String],      // granular permission list

  // Account Status
  status: String,             // 'active' | 'inactive' | 'suspended' | 'pending_verification'

  // Profile Information
  profile: {
    displayName: String,
    avatar: {
      type: String,           // 'default' | 'custom' | 'google'
      value: String           // URL or avatar ID
    },
    bio: String
  },

  // Activity Tracking
  lastActive: Date,           // last activity timestamp
  lastLogin: Date,            // last successful login
  createdAt: Date,            // account creation date
  updatedAt: Date,            // last update date
  createdBy: ObjectId         // admin who created this account
}
```

## Key Features

- **Multi-Auth Support**: Email/password and Google OAuth authentication
- **Role-Based Access**: Hierarchical permission system with specific roles
- **OAuth Integration**: Full Google SSO support with profile synchronization
- **Activity Tracking**: Comprehensive login and activity monitoring
- **Account Lifecycle**: Complete account management from creation to suspension

## Admin Roles

### Super Admin
- Full system access
- User and story management
- System configuration
- Analytics and reporting
- Other admin account management

### Story Editor
- Story content management
- Review moderation
- Genre management
- Story publishing controls

### User Manager
- User account management
- Support ticket handling
- User analytics
- Content flagging management

### Achievement Manager
- Achievement creation and management
- Avatar system administration
- Game mechanics configuration
- User progress analytics

## Permission System

### Granular Permissions List
```javascript
const PERMISSIONS = {
  // User Management
  'users.read': 'View user accounts and data',
  'users.create': 'Create new user accounts',
  'users.update': 'Modify user account information',
  'users.delete': 'Delete user accounts',
  'users.suspend': 'Suspend user accounts',

  // Story Management
  'stories.read': 'View story content and analytics',
  'stories.create': 'Create new stories',
  'stories.update': 'Modify story content',
  'stories.delete': 'Delete stories',
  'stories.publish': 'Publish/unpublish stories',

  // Moderation
  'moderation.reviews': 'Moderate user reviews',
  'moderation.content': 'Moderate story content',
  'moderation.flags': 'Review content flags',

  // System Administration
  'system.config': 'Modify system configuration',
  'system.analytics': 'View system analytics',
  'system.admins': 'Manage admin accounts',

  // Game Mechanics
  'achievements.manage': 'Manage achievements',
  'avatars.manage': 'Manage avatar system',
  'credits.manage': 'Manage credit economy'
};
```

## Key Indexes

```javascript
// Unique identifiers
db.AdminAccounts.createIndex({ email: 1 }, { unique: true });
db.AdminAccounts.createIndex({ username: 1 }, { unique: true });

// OAuth authentication
db.AdminAccounts.createIndex({ "authentication.googleId": 1 }, { unique: true, sparse: true });
db.AdminAccounts.createIndex({ "authentication.googleEmail": 1 }, { unique: true, sparse: true });

// Role and status filtering
db.AdminAccounts.createIndex({ role: 1 });
db.AdminAccounts.createIndex({ status: 1 });
db.AdminAccounts.createIndex({ lastActive: 1 });
```

## Query Examples

### Find admin by email
```javascript
db.AdminAccounts.findOne({
  email: "admin@talepick.com",
  status: "active"
});
```

### Authenticate with Google OAuth
```javascript
db.AdminAccounts.findOne({
  "authentication.googleId": "google_oauth_id"
});
```

### Get all active admins by role
```javascript
db.AdminAccounts.find({
  status: "active",
  role: { $in: ["Super Admin", "Story Editor"] }
})
.select({
  username: 1,
  email: 1,
  role: 1,
  profile: 1,
  lastActive: 1
})
.sort({ lastActive: -1 });
```

### Check admin permissions
```javascript
db.AdminAccounts.findOne(
  { _id: ObjectId("admin_id") },
  { role: 1, permissions: 1 }
);
```

### Update last login
```javascript
db.AdminAccounts.updateOne(
  { _id: ObjectId("admin_id") },
  {
    $set: {
      lastLogin: new Date(),
      lastActive: new Date()
    }
  }
);
```

### Create new admin account
```javascript
const newAdmin = {
  username: "new_admin",
  email: "admin@talepick.com",
  passwordHash: bcrypt.hashSync("secure_password"),
  authentication: {
    authMethod: "email",
    hasPassword: true,
    lastPasswordChange: new Date()
  },
  role: "Story Editor",
  permissions: [
    "stories.read",
    "stories.create",
    "stories.update",
    "stories.publish",
    "moderation.reviews"
  ],
  status: "active",
  profile: {
    displayName: "New Admin",
    avatar: { type: "default" },
    bio: "Story content moderator"
  },
  createdAt: new Date(),
  createdBy: ObjectId("creating_admin_id")
};

db.AdminAccounts.create(newAdmin);
```

## OAuth Integration

### Google SSO Flow
```javascript
// Link Google account to existing admin
db.AdminAccounts.updateOne(
  { _id: ObjectId("admin_id") },
  {
    $set: {
      "authentication.authMethod": "both",
      "authentication.googleId": "google_oauth_id",
      "authentication.googleEmail": "admin@gmail.com",
      "authentication.googleProfile": {
        displayName: "Admin Name",
        profileImageUrl: "https://...",
        locale: "en"
      }
    }
  }
);
```

## Authentication Methods

### Email/Password Only
```javascript
{
  authentication: {
    authMethod: "email",
    hasPassword: true,
    lastPasswordChange: new Date()
  }
}
```

### Google SSO Only
```javascript
{
  authentication: {
    authMethod: "google",
    googleId: "google_oauth_id",
    googleEmail: "admin@gmail.com",
    hasPassword: false
  }
}
```

### Both Methods
```javascript
{
  authentication: {
    authMethod: "both",
    googleId: "google_oauth_id",
    googleEmail: "admin@gmail.com",
    hasPassword: true,
    lastPasswordChange: new Date()
  }
}
```

## Security Features

### Password Requirements
- Minimum 8 characters
- Include uppercase, lowercase, numbers, and special characters
- Password history tracking
- Expiration reminders

### Session Security
- Secure session tokens
- Automatic logout after inactivity
- IP-based session validation
- Device tracking

### Account Security
- Two-factor authentication support
- Login attempt monitoring
- Suspicious activity detection
- Account lockout after failed attempts

## Integration Points

### AdminLoginHistory Collection
- Track all login attempts
- Monitor failed login patterns
- Security event correlation
- Geographic login analysis

### AdminLogs Collection
- Audit trail of all admin actions
- Action attribution and responsibility
- Compliance and reporting
- Performance monitoring

### UserSessions Collection
- Distinguish admin vs user sessions
- Session management and cleanup
- Security monitoring
- Access pattern analysis

## Admin Account Management

### Account Creation
- Manual creation by existing admin
- Invitation-based onboarding
- Initial password setup
- Role assignment during creation

### Role Changes
- Permission re-evaluation
- Session invalidation for security
- Audit logging of role changes
- Notification to affected admin

### Account Suspension
- Immediate access revocation
- Session termination
- Audit trail creation
- Recovery process

## Performance Optimization

- **Efficient Authentication**: Optimized indexes for login queries
- **Session Management**: Fast admin session validation
- **Permission Caching**: Cache frequently checked permissions
- **Activity Logging**: Efficient audit trail maintenance

## Compliance and Auditing

### Data Protection
- PII encryption for sensitive fields
- GDPR compliance features
- Data retention policies
- Right to deletion support

### Audit Requirements
- Complete action logging
- Immutable audit trail
- Regulatory compliance
- forensic data preservation

## Analytics and Monitoring

### Key Metrics
- Admin activity levels
- Login frequency and patterns
- Permission usage statistics
- Security event rates

### Dashboard Views
- Active admin overview
- Recent activity feed
- Security alerts
- Performance metrics

---

*Last updated: December 2024*