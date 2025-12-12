# UserSessions Collection

## Purpose

User session management with OAuth support for secure authentication, device tracking, and session lifecycle management on the TalePick platform.

## Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // references Users - session owner
  sessionToken: String,       // JWT token identifier or session ID

  // Device Information
  deviceInfo: {
    userAgent: String,        // Browser and OS information
    platform: String,         // 'web' | 'mobile' | 'tablet' | 'desktop'
    browser: String,          // 'chrome' | 'firefox' | 'safari' | 'edge'
    ip: String                // IP address of the device
  },

  // Authentication Details
  authentication: {
    authMethod: String,       // 'email' | 'google' | 'guest'
    oauthProvider: String,    // 'google', null for email/guest
    oauthAccessToken: String, // encrypted OAuth access token
    oauthRefreshToken: String, // encrypted OAuth refresh token
    oauthExpiresAt: Date      // OAuth token expiration time
  },

  // Session State
  isActive: Boolean,          // whether session is currently active
  lastActivity: Date,         // last user activity timestamp

  // Timestamps
  createdAt: Date,            // session creation time
  expiresAt: Date             // session expiration time
}
```

## Key Features

- **Multi-Auth Support**: Handles email, Google OAuth, and guest authentication
- **Device Tracking**: Comprehensive device and browser information collection
- **Security Monitoring**: IP-based security and session anomaly detection
- **OAuth Integration**: Secure token storage and refresh capabilities
- **Session Lifecycle**: Complete session management from creation to expiration

## Authentication Methods

### Email Authentication
```javascript
{
  authentication: {
    authMethod: "email",
    oauthProvider: null,
    oauthAccessToken: null,
    oauthRefreshToken: null,
    oauthExpiresAt: null
  }
}
```

### Google OAuth
```javascript
{
  authentication: {
    authMethod: "google",
    oauthProvider: "google",
    oauthAccessToken: "encrypted_access_token",
    oauthRefreshToken: "encrypted_refresh_token",
    oauthExpiresAt: new Date(Date.now() + 3600 * 1000) // 1 hour
  }
}
```

### Guest Access
```javascript
{
  authentication: {
    authMethod: "guest",
    oauthProvider: null,
    oauthAccessToken: null,
    oauthRefreshToken: null,
    oauthExpiresAt: null
  }
}
```

## Device Information Classification

### Platform Detection
- **web**: Desktop/laptop web browsers
- **mobile**: Mobile phone browsers
- **tablet**: Tablet devices
- **desktop**: Desktop applications

### Browser Detection
- **chrome**: Google Chrome browser
- **firefox**: Mozilla Firefox
- **safari**: Apple Safari
- **edge**: Microsoft Edge
- **other**: Other browsers

## Key Indexes

```javascript
// Session validation - fast token lookup
db.UserSessions.createIndex({ sessionToken: 1 }, { unique: true });

// User session management - find all user sessions
db.UserSessions.createIndex({ userId: 1, isActive: 1 });

// Session cleanup - find expired sessions
db.UserSessions.createIndex({ expiresAt: 1 });

// Security monitoring - track sessions by IP
db.UserSessions.createIndex({ "deviceInfo.ip": 1 });

// Activity tracking - find inactive sessions
db.UserSessions.createIndex({ lastActivity: 1 });
```

## Query Examples

### Validate user session
```javascript
db.UserSessions.findOne({
  sessionToken: "session_token_12345",
  isActive: true,
  expiresAt: { $gt: new Date() }
})
.populate('userId', 'username email profile.displayName');
```

### Get user's active sessions
```javascript
db.UserSessions.find({
  userId: ObjectId("user_id"),
  isActive: true,
  expiresAt: { $gt: new Date() }
})
.sort({ lastActivity: -1 })
.select({
  sessionToken: 1,
  deviceInfo: 1,
  authentication: 1,
  lastActivity: 1,
  createdAt: 1,
  expiresAt: 1
});
```

### Create new user session
```javascript
const newSession = {
  userId: ObjectId("user_id"),
  sessionToken: generateSecureToken(),
  deviceInfo: {
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    platform: "desktop",
    browser: "chrome",
    ip: "192.168.1.100"
  },
  authentication: {
    authMethod: "email",
    oauthProvider: null
  },
  isActive: true,
  lastActivity: new Date(),
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
};

db.UserSessions.create(newSession);
```

### Update session activity
```javascript
db.UserSessions.updateOne(
  { sessionToken: "session_token_12345" },
  {
    $set: {
      lastActivity: new Date(),
      // Optionally extend expiration on activity
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  }
);
```

### Terminate user session
```javascript
db.UserSessions.updateOne(
  { sessionToken: "session_token_12345" },
  { $set: { isActive: false } }
);
```

### Terminate all user sessions (password change, security issue)
```javascript
db.UserSessions.updateMany(
  { userId: ObjectId("user_id") },
  { $set: { isActive: false } }
);
```

### Cleanup expired sessions
```javascript
const cleanupResult = await db.UserSessions.deleteMany({
  $or: [
    { expiresAt: { $lt: new Date() } },
    { isActive: false, lastActivity: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
  ]
});
```

### Get session analytics
```javascript
db.UserSessions.aggregate([
  { $match: { isActive: true } },
  { $group: {
    _id: {
      platform: "$deviceInfo.platform",
      browser: "$deviceInfo.browser"
    },
    count: { $sum: 1 },
    uniqueUsers: { $addToSet: "$userId" }
  }},
  { $group: {
    _id: "$_id.platform",
    browsers: {
      $push: {
        browser: "$_id.browser",
        count: "$count"
      }
    },
    totalSessions: { $sum: "$count" },
    totalUsers: { $sum: { $size: "$uniqueUsers" } }
  }},
  { $sort: { totalSessions: -1 } }
]);
```

### Detect suspicious session activity
```javascript
// Find user with sessions from multiple IPs in short time
const suspiciousActivity = await db.UserSessions.aggregate([
  { $match: {
    userId: ObjectId("user_id"),
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // last hour
  }},
  { $group: {
    _id: "$userId",
    uniqueIPs: { $addToSet: "$deviceInfo.ip" },
    sessionCount: { $sum: 1 },
    locations: { $push: { ip: "$deviceInfo.ip", createdAt: "$createdAt" } }
  }},
  { $match: { uniqueIPs: { $size: { $gt: 1 } } } }
]);
```

## OAuth Token Management

### Token Refresh Process
```javascript
const refreshOAuthToken = async (sessionId) => {
  const session = await db.UserSessions.findById(sessionId);

  if (session.authentication.oauthProvider === 'google' &&
      session.authentication.oauthExpiresAt < new Date()) {

    const newTokens = await refreshGoogleTokens(session.authentication.oauthRefreshToken);

    await db.UserSessions.updateOne(
      { _id: sessionId },
      {
        $set: {
          "authentication.oauthAccessToken": encrypt(newTokens.access_token),
          "authentication.oauthRefreshToken": encrypt(newTokens.refresh_token),
          "authentication.oauthExpiresAt": new Date(Date.now() + newTokens.expires_in * 1000)
        }
      }
    );
  }
};
```

### OAuth Session Creation
```javascript
const createOAuthSession = async (userId, oauthTokens, deviceInfo) => {
  const session = {
    userId: userId,
    sessionToken: generateSecureToken(),
    deviceInfo: parseUserAgent(deviceInfo.userAgent),
    authentication: {
      authMethod: "google",
      oauthProvider: "google",
      oauthAccessToken: encrypt(oauthTokens.access_token),
      oauthRefreshToken: encrypt(oauthTokens.refresh_token),
      oauthExpiresAt: new Date(Date.now() + oauthTokens.expires_in * 1000)
    },
    isActive: true,
    lastActivity: new Date(),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  };

  return await db.UserSessions.create(session);
};
```

## Security Features

### IP-Based Security
```javascript
const detectIPAnomalies = async (userId, currentIP) => {
  const userSessions = await db.UserSessions.find({
    userId: userId,
    isActive: true,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // last 24 hours
  }).select('deviceInfo.ip createdAt');

  const recentIPs = userSessions.map(s => s.deviceInfo.ip);

  if (recentIPs.length > 0 && !recentIPs.includes(currentIP)) {
    // Log suspicious activity
    await createSecurityEvent({
      userId: userId,
      eventType: "suspicious_login",
      description: `Login from new IP: ${currentIP}`,
      eventDetails: {
        newIP: currentIP,
        knownIPs: recentIPs,
        riskScore: 60
      }
    });
  }
};
```

### Session Validation
```javascript
const validateSession = async (sessionToken) => {
  const session = await db.UserSessions.findOne({
    sessionToken: sessionToken,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).populate('userId');

  if (!session) {
    return null;
  }

  // Update last activity
  await db.UserSessions.updateOne(
    { _id: session._id },
    { $set: { lastActivity: new Date() } }
  );

  // Check OAuth token expiration
  if (session.authentication.oauthProvider === 'google' &&
      session.authentication.oauthExpiresAt < new Date()) {
    await refreshOAuthToken(session._id);
  }

  return session;
};
```

### Device Fingerprinting
```javascript
const generateDeviceFingerprint = (deviceInfo) => {
  const components = [
    deviceInfo.userAgent,
    deviceInfo.platform,
    deviceInfo.browser,
    // Add more unique device characteristics
  ];

  return crypto.createHash('sha256')
    .update(components.join('|'))
    .digest('hex');
};
```

## Integration Points

### Users Collection
- Reference user account information
- Update last login timestamps
- Track concurrent session limits

### SecurityEvents Collection
- Create security events for suspicious activity
- Correlate session anomalies with security threats
- Automated threat response integration

### AdminLoginHistory Collection
- Separate admin session tracking
- Different security policies for admin sessions
- Admin activity monitoring

### OTP Verification
- Session creation after successful OTP verification
- Temporary session management for registration flow
- Secure session handoff post-verification

## Performance Optimization

- **Efficient Indexing**: Fast session validation and cleanup
- **Memory Management**: Regular cleanup of expired sessions
- **Caching**: Cache active session information
- **Batch Operations**: Efficient bulk session termination

## Analytics and Monitoring

### Session Metrics
- Active session count by platform
- Session duration statistics
- Authentication method distribution
- Geographic access patterns

### Security Monitoring
- Concurrent session anomalies
- Geographic access anomalies
- Device fingerprint tracking
- Token refresh patterns

### User Experience
- Session frequency analysis
- Device preference tracking
- Authentication success rates
- Session failure analysis

## Privacy and Compliance

### Data Protection
- Encrypted OAuth token storage
- IP address anonymization options
- Device data retention policies
- GDPR compliance features

### Session Privacy
- Minimal data collection
- User-controlled session management
- Transparent session tracking
- Right to session deletion

---

*Last updated: December 2024*