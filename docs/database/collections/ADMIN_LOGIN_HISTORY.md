# AdminLoginHistory Collection

## Mongoose Model Reference
- **Model File**: AdminLoginHistory.ts (singular)
- **Model Class**: AdminLoginHistory (singular)
- **Collection**: admin_login_history (plural, with underscores for readability)


**Purpose**

Admin login tracking and security monitoring for TalePick platform administration access control and threat detection.

## Schema

```javascript
{
  _id: ObjectId,
  adminId: ObjectId,          // references AdminAccounts - admin who attempted login

  // Login Information
  loginTime: Date,            // when the login attempt occurred
  method: String,             // 'email' | 'google' - authentication method used
  success: Boolean,           // whether the login attempt was successful

  // Connection Details
  ip: String,                 // IP address of the client
  userAgent: String,          // browser and device information

  // Geographic Information
  location: {
    country: String,          // country derived from IP
    city: String,             // city derived from IP
    timezone: String          // timezone derived from IP
  },

  // Session Information
  sessionId: String,          // unique session identifier
  sessionExpiresAt: Date,     // when the session expires

  // Failure Information
  failureReason: String,      // reason for failed login attempt

  createdAt: Date             // document creation timestamp
}
```

## Key Features

- **Comprehensive Tracking**: Records all login attempts, successful and failed
- **Security Monitoring**: IP-based threat detection and geographic analysis
- **Session Management**: Tracks session lifecycle and expiration
- **Failure Analysis**: Detailed failure reason tracking for security analysis
- **Geographic Intelligence**: Location-based access pattern monitoring

## Login Methods

- **email**: Traditional email and password authentication
- **google**: Google OAuth SSO authentication

## Failure Reasons

- **invalid_credentials**: Incorrect email or password
- **account_disabled**: Admin account is suspended or inactive
- **rate_limit_exceeded**: Too many login attempts
- **invalid_session**: Session token validation failed
- **geolocation_blocked**: Access from restricted location
- **oauth_error**: Google OAuth authentication failed

## Key Indexes

```javascript
// Admin's login history - for personal security review
db.AdminLoginHistory.createIndex({ adminId: 1, loginTime: -1 });

// Security monitoring - track suspicious IPs
db.AdminLoginHistory.createIndex({ ip: 1 });

// Failed login tracking - for security alerts
db.AdminLoginHistory.createIndex({ success: 1, loginTime: -1 });

// Session management - active session tracking
db.AdminLoginHistory.createIndex({ sessionId: 1 });

// Automatic cleanup - TTL for old records
db.AdminLoginHistory.createIndex({ createdAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 years
```

## Query Examples

### Get admin's recent login history
```javascript
db.AdminLoginHistory.find({ adminId: ObjectId("admin_id") })
  .sort({ loginTime: -1 })
  .limit(20)
  .select({
    loginTime: 1,
    method: 1,
    success: 1,
    ip: 1,
    location: 1,
    failureReason: 1
  });
```

### Get failed login attempts for security monitoring
```javascript
db.AdminLoginHistory.find({
  success: false,
  loginTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // last 24 hours
})
  .sort({ loginTime: -1 })
  .populate('adminId', 'username email');
```

### Detect suspicious IP activity
```javascript
db.AdminLoginHistory.aggregate([
  { $match: { loginTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
  { $group: {
    _id: "$ip",
    totalAttempts: { $sum: 1 },
    failedAttempts: {
      $sum: { $cond: [{ $eq: ["$success", false] }, 1, 0] }
    },
    uniqueAdmins: { $addToSet: "$adminId" },
    countries: { $addToSet: "$location.country" }
  }},
  { $match: {
    $or: [
      { failedAttempts: { $gt: 10 } },
      { totalAttempts: { $gt: 50 } },
      { $expr: { $gt: [{ $size: "$uniqueAdmins" }, 5] } }
    ]
  }},
  { $sort: { failedAttempts: -1 } }
]);
```

### Get active admin sessions
```javascript
db.AdminLoginHistory.find({
  success: true,
  sessionExpiresAt: { $gt: new Date() }
})
  .sort({ loginTime: -1 })
  .populate('adminId', 'username email role');
```

### Geographic login analysis
```javascript
db.AdminLoginHistory.aggregate([
  { $match: {
    success: true,
    loginTime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // last 7 days
  }},
  { $group: {
    _id: {
      adminId: "$adminId",
      country: "$location.country"
    },
    loginCount: { $sum: 1 },
    cities: { $addToSet: "$location.city" }
  }},
  { $group: {
    _id: "$_id.adminId",
    countries: { $addToSet: "$_id.country" },
    totalLogins: { $sum: "$loginCount" }
  }},
  { $match: { countries: { $size: { $gt: 1 } } } }, // admins who logged in from multiple countries
  { $sort: { totalLogins: -1 } },
  { $lookup: {
    from: "AdminAccounts",
    localField: "_id",
    foreignField: "_id",
    as: "admin"
  }},
  { $unwind: "$admin" },
  { $project: {
    username: "$admin.username",
    email: "$admin.email",
    countries: 1,
    totalLogins: 1
  }}
]);
```

### Create login attempt record
```javascript
const loginAttempt = {
  adminId: ObjectId("admin_id"),
  loginTime: new Date(),
  method: "email",
  success: false,
  ip: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  location: {
    country: "Thailand",
    city: "Bangkok",
    timezone: "Asia/Bangkok"
  },
  failureReason: "invalid_credentials",
  createdAt: new Date()
};

db.AdminLoginHistory.create(loginAttempt);
```

## Security Monitoring

### Automated Threat Detection

#### Brute Force Detection
```javascript
// Detect potential brute force attacks on admin accounts
const bruteForceThreshold = 5;
const timeWindow = 15 * 60 * 1000; // 15 minutes

const suspiciousActivity = await db.AdminLoginHistory.aggregate([
  { $match: {
    success: false,
    loginTime: { $gte: new Date(Date.now() - timeWindow) }
  }},
  { $group: {
    _id: "$adminId",
    failedAttempts: { $sum: 1 },
    uniqueIPs: { $addToSet: "$ip" },
    lastAttempt: { $max: "$loginTime" }
  }},
  { $match: { failedAttempts: { $gte: bruteForceThreshold } } }
]);
```

#### Geographic Anomaly Detection
```javascript
// Detect logins from unusual geographic locations
const geographicAnomalies = await db.AdminLoginHistory.aggregate([
  { $match: { success: true } },
  { $group: {
    _id: "$adminId",
    countries: { $addToSet: "$location.country" },
    recentLogins: {
      $push: {
        $cond: {
          if: { $gte: ["$loginTime", new Date(Date.now() - 24 * 60 * 60 * 1000)] },
          then: {
            country: "$location.country",
            city: "$location.city",
            loginTime: "$loginTime"
          },
          else: null
        }
      }
    }
  }},
  { $match: {
    $expr: { $gt: [{ $size: "$countries" }, 1] }
  }}
]);
```

## Session Management

### Session Tracking
```javascript
// Track active sessions per admin
const activeSessions = await db.AdminLoginHistory.aggregate([
  { $match: {
    success: true,
    sessionExpiresAt: { $gt: new Date() }
  }},
  { $group: {
    _id: "$adminId",
    activeSessions: { $sum: 1 },
    sessions: {
      $push: {
        sessionId: "$sessionId",
        loginTime: "$loginTime",
        ip: "$ip",
        expiresAt: "$sessionExpiresAt"
      }
    }
  }},
  { $lookup: {
    from: "AdminAccounts",
    localField: "_id",
    foreignField: "_id",
    as: "admin"
  }},
  { $unwind: "$admin" }
]);
```

### Session Cleanup
```javascript
// Clean up expired sessions and create cleanup logs
const cleanupResult = await db.AdminLoginHistory.updateMany(
  { sessionExpiresAt: { $lt: new Date() } },
  { $set: { sessionExpired: true } }
);
```

## Integration Points

### AdminAccounts Collection
- Link login attempts to admin accounts
- Update last login timestamps
- Trigger account security measures

### SecurityEvents Collection
- Create security events for suspicious activities
- Correlate login patterns with security threats
- Automated threat response triggers

### UserSessions Collection
- Separate admin and user session tracking
- Different security policies and monitoring
- Session management across user types

## Performance Optimization

- **Index Strategy**: Optimized for security monitoring queries
- **TTL Cleanup**: Automatic removal of old login records
- **Efficient Aggregation**: Fast security analytics processing
- **Memory Management**: Prevent unbounded growth with TTL indexes

## Compliance and Auditing

### Data Retention
- Configurable retention period (default 2 years)
- GDPR compliance with automatic cleanup
- Audit trail preservation for security investigations
- Data export capabilities for compliance reporting

### Privacy Protection
- IP address anonymization options
- Location data precision control
- Sensitive field encryption
- Access logging for login history queries

## Analytics and Reporting

### Security Dashboard Metrics
- Failed login rate trends
- Geographic access patterns
- Session duration statistics
- Threat detection alerts

### Admin Activity Reports
- Login frequency by admin
- Authentication method usage
- Geographic access distribution
- Security event correlation

---

*Last updated: December 2024*