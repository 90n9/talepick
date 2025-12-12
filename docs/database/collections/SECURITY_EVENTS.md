# SecurityEvents Collection

## Purpose

Security monitoring and automatic threat detection for comprehensive protection of the TalePick platform against malicious activities and security breaches.

## Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // can be null for anonymous events
  eventType: String,          // 'failed_login' | 'multiple_failed_attempts' | 'suspicious_ip' | 'privilege_escalation' | 'data_breach_attempt'
  severity: String,           // 'low' | 'medium' | 'high' | 'critical'
  status: String,             // 'detected' | 'investigating' | 'resolved' | 'false_positive'
  description: String,        // Human-readable description of the event

  // Event Details
  eventDetails: {
    loginAttempts: Number,    // for failed login events
    timeWindow: Number,       // time window in minutes
    ipAddress: String,        // source IP address
    userAgent: String,        // browser/device information
    riskScore: Number,        // calculated risk score (0-100)
    targetResource: String,   // what was being targeted
    additionalData: Object    // additional event-specific data
  },

  // Response Actions
  actionTaken: String,        // 'none' | 'account_locked' | 'ip_blocked' | 'admin_notified' | 'session_terminated'
  actionDetails: {
    lockDuration: Number,     // duration of account lock in minutes
    autoUnlockAt: Date,       // when automatic unlock should occur
    requiresManualReview: Boolean,
    notifiedAdmins: [ObjectId] // admins who were notified
  },

  // Resolution Information
  resolvedBy: ObjectId,       // admin who resolved the event
  resolvedAt: Date,           // when event was resolved
  resolutionNotes: String,    // notes about resolution

  timestamp: Date             // when event was detected
}
```

## Key Features

- **Automatic Detection**: Real-time identification of security threats
- **Risk Scoring**: Quantitative assessment of threat severity
- **Automated Response**: Immediate action for critical threats
- **Comprehensive Tracking**: Full lifecycle from detection to resolution
- **Admin Integration**: Seamless handoff to human security teams

## Event Types

### Authentication Security
- **failed_login**: Single failed login attempt
- **multiple_failed_attempts**: Multiple failed logins from same source
- **account_lockout**: Account automatically locked due to failed attempts
- **suspicious_login**: Login from unusual location or device

### Access Control
- **privilege_escalation**: Attempt to access unauthorized resources
- **role_violation**: User attempting actions beyond their role
- **admin_impersonation**: Attempt to impersonate admin privileges
- **session_hijacking**: Evidence of session theft or reuse

### Data Security
- **data_breach_attempt**: Large data access or extraction attempts
- **api_abuse**: Excessive API calls or unusual patterns
- **data_exfiltration**: Signs of unauthorized data download
- **sql_injection**: Attempted SQL injection attacks

### System Security
- **denial_of_service**: DOS attack patterns
- **malicious_payload**: Uploaded malicious files or scripts
- **vulnerability_scan**: Automated vulnerability scanning attempts
- **brute_force**: Systematic attack attempts

## Severity Levels

### Low
- Single failed login attempt
- Unusual but not threatening activity
- Minor configuration errors
- Low-volume unusual patterns

### Medium
- Multiple failed attempts from same source
- Suspicious access patterns
- Privilege escalation attempts
- Moderate-volume suspicious activity

### High
- Coordinated attack patterns
- Successful privilege escalation
- Data breach indicators
- High-volume malicious activity

### Critical
- System compromise evidence
- Successful data breach
- Widespread account compromise
- Active system exploitation

## Key Indexes

```javascript
// Event type and time-based queries - for monitoring dashboards
db.SecurityEvents.createIndex({ eventType: 1, timestamp: -1 });

// Severity-based filtering - for prioritized response
db.SecurityEvents.createIndex({ severity: 1, status: 1 });

// User-specific security events - for user security review
db.SecurityEvents.createIndex({ userId: 1, timestamp: -1 });

// Status workflow - for security team management
db.SecurityEvents.createIndex({ status: 1, timestamp: 1 });

// TTL for resolved events - automatic cleanup
db.SecurityEvents.createIndex({ resolvedAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

// IP-based tracking - for geographic and network analysis
db.SecurityEvents.createIndex({ "eventDetails.ipAddress": 1 });
```

## Query Examples

### Get active security threats
```javascript
db.SecurityEvents.find({
  status: { $in: ["detected", "investigating"] },
  severity: { $in: ["high", "critical"] }
})
  .sort({ timestamp: -1 })
  .populate('userId', 'username email');
```

### Get user's security event history
```javascript
db.SecurityEvents.find({ userId: ObjectId("user_id") })
  .sort({ timestamp: -1 })
  .limit(20)
  .select({
    eventType: 1,
    severity: 1,
    status: 1,
    description: 1,
    timestamp: 1
  });
```

### Get IP-based threat analysis
```javascript
db.SecurityEvents.aggregate([
  { $match: {
    "eventDetails.ipAddress": "192.168.1.100",
    timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // last 24 hours
  }},
  { $group: {
    _id: "$eventDetails.ipAddress",
    totalEvents: { $sum: 1 },
    severityBreakdown: {
      $push: {
        eventType: "$eventType",
        severity: "$severity",
        timestamp: "$timestamp"
      }
    },
    uniqueUsers: { $addToSet: "$userId" },
    maxRiskScore: { $max: "$eventDetails.riskScore" }
  }},
  { $sort: { maxRiskScore: -1 } }
]);
```

### Create security event
```javascript
const securityEvent = {
  userId: ObjectId("user_id"),
  eventType: "multiple_failed_attempts",
  severity: "high",
  status: "detected",
  description: "Multiple failed login attempts detected",
  eventDetails: {
    loginAttempts: 15,
    timeWindow: 10,
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0...",
    riskScore: 85,
    targetResource: "/api/auth/login"
  },
  actionTaken: "account_locked",
  actionDetails: {
    lockDuration: 30,
    autoUnlockAt: new Date(Date.now() + 30 * 60 * 1000),
    requiresManualReview: true
  },
  timestamp: new Date()
};

db.SecurityEvents.create(securityEvent);
```

### Get security dashboard statistics
```javascript
db.SecurityEvents.aggregate([
  { $match: {
    timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // last 24 hours
  }},
  { $group: {
    _id: {
      eventType: "$eventType",
      severity: "$severity"
    },
    count: { $sum: 1 },
    activeCount: {
      $sum: { $cond: [{ $in: ["$status", ["detected", "investigating"]] }, 1, 0] }
    }
  }},
  { $group: {
    _id: "$_id.eventType",
    severities: {
      $push: {
        severity: "$_id.severity",
        count: "$count",
        activeCount: "$activeCount"
      }
    },
    totalCount: { $sum: "$count" }
  }},
  { $sort: { totalCount: -1 } }
]);
```

### Get events requiring admin attention
```javascript
db.SecurityEvents.find({
  status: "detected",
  severity: { $in: ["medium", "high", "critical"] },
  "actionDetails.requiresManualReview": true
})
  .sort({ "eventDetails.riskScore": -1 })
  .populate('userId', 'username email');
```

## Automated Detection Rules

### Failed Login Detection
```javascript
// Detect multiple failed login attempts
const detectFailedLogins = async (ip, timeWindow = 15, threshold = 5) => {
  const recentFailures = await db.AdminLoginHistory.countDocuments({
    ip: ip,
    success: false,
    loginTime: { $gte: new Date(Date.now() - timeWindow * 60 * 1000) }
  });

  if (recentFailures >= threshold) {
    await createSecurityEvent({
      eventType: "multiple_failed_attempts",
      severity: recentFailures >= 10 ? "high" : "medium",
      eventDetails: {
        loginAttempts: recentFailures,
        timeWindow: timeWindow,
        ipAddress: ip,
        riskScore: Math.min(100, recentFailures * 10)
      }
    });
  }
};
```

### Geographic Anomaly Detection
```javascript
// Detect logins from unusual geographic locations
const detectGeographicAnomalies = async (userId, newLocation) => {
  const userHistory = await db.AdminLoginHistory.find({
    userId: userId,
    success: true,
    loginTime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // last 30 days
  }).select('location.country location.city');

  const recentCountries = [...new Set(userHistory.map(h => h.location.country))];

  if (recentCountries.length > 0 && !recentCountries.includes(newLocation.country)) {
    await createSecurityEvent({
      userId: userId,
      eventType: "suspicious_login",
      severity: "medium",
      eventDetails: {
        ipAddress: newLocation.ip,
        riskScore: 60,
        additionalData: {
          usualCountries: recentCountries,
          newCountry: newLocation.country
        }
      }
    });
  }
};
```

### API Abuse Detection
```javascript
// Detect excessive API usage patterns
const detectAPIAbuse = async (userId, endpoint, timeWindow = 60, threshold = 1000) => {
  const requestCount = await db.Analytics.countDocuments({
    userId: userId,
    eventType: "api_call",
    metadata: { endpoint: endpoint },
    timestamp: { $gte: new Date(Date.now() - timeWindow * 1000) }
  });

  if (requestCount >= threshold) {
    await createSecurityEvent({
      userId: userId,
      eventType: "api_abuse",
      severity: requestCount >= 5000 ? "high" : "medium",
      eventDetails: {
        targetResource: endpoint,
        riskScore: Math.min(100, Math.floor(requestCount / 10)),
        additionalData: {
          requestCount: requestCount,
          timeWindow: timeWindow
        }
      }
    });
  }
};
```

## Automated Response Actions

### Account Locking
```javascript
const lockUserAccount = async (userId, duration = 30) => {
  await db.Users.updateOne(
    { _id: userId },
    {
      $set: {
        "accountStatus.status": "suspended",
        "accountStatus.lockType": "auto_security",
        "accountStatus.lockExpiresAt": new Date(Date.now() + duration * 60 * 1000)
      }
    }
  );

  // Terminate active sessions
  await db.UserSessions.updateMany(
    { userId: userId },
    { $set: { isActive: false } }
  );
};
```

### IP Blocking
```javascript
const blockIP = async (ip, duration = 60) => {
  // Add to IP blocklist (could be separate collection or Redis)
  await db.IPBlocklist.create({
    ip: ip,
    blockedAt: new Date(),
    expiresAt: new Date(Date.now() + duration * 60 * 1000),
    reason: "Automated security response"
  });
};
```

## Integration Points

### AdminAccounts Collection
- Notify relevant security admins
- Check admin permissions for security actions
- Track security team response times

### Users Collection
- Automatic account locking/unlocking
- Security event correlation with user activity
- User security dashboard integration

### UserSessions Collection
- Session termination for compromised accounts
- Real-time session security monitoring
- Geographic anomaly detection

### AdminLoginHistory Collection
- Correlate login attempts with security events
- Admin account security monitoring
- Privileged access pattern analysis

## Security Dashboard Features

### Real-time Monitoring
- Active threat count and severity
- Automated response effectiveness
- Security team workload tracking
- Threat trend analysis

### Investigation Tools
- Event timeline reconstruction
- Related event clustering
- User behavior analysis
- Geographic visualization

### Reporting
- Daily security summary
- Threat landscape analysis
- Response time metrics
- Compliance reporting

## Performance Optimization

- **Efficient Indexing**: Optimized for real-time monitoring queries
- **TTL Cleanup**: Automatic removal of resolved events
- **Event Aggregation**: Efficient bulk event processing
- **Memory Management**: Prevent unbounded growth with archival policies

## Compliance and Legal

### Data Protection
- Event data encryption
- Privacy-preserving analytics
- Right to access and deletion
- Data residency compliance

### Legal Requirements
- Incident reporting capabilities
- Forensic data preservation
- Audit trail maintenance
- Regulatory compliance reporting

---

*Last updated: December 2024*