# AdminLogs Collection

## Purpose

Admin action audit trail for comprehensive tracking, compliance, and security monitoring of all administrative activities on the TalePick platform.

## Schema

```javascript
{
  _id: ObjectId,

  // Admin Information
  adminId: ObjectId,           // references AdminAccounts - admin who performed action
  adminName: String,           // denormalized admin name for quick reference
  role: String,                // admin's role at time of action

  // Action Details
  action: String,              // Description of action performed
  target: String,              // What was affected (user ID, story ID, etc.)
  targetType: String,          // 'story' | 'user' | 'system' | 'finance' | 'achievement'

  // Change Details
  changeDetails: {
    before: Object,            // State before change (optional)
    after: Object             // State after change (optional)
  },

  // Request Context
  ip: String,                  // IP address of admin client
  userAgent: String,           // Browser and device information
  sessionId: String,           // Admin session identifier

  // Timestamp
  timestamp: Date              // When action occurred
}
```

## Key Features

- **Complete Audit Trail**: Records all admin actions with full context
- **Change Tracking**: Before and after states for comprehensive audit
- **Action Classification**: Categorization for different types of administrative work
- **Security Context**: IP, session, and device tracking for security monitoring
- **Compliance Support**: Meets auditing requirements for regulatory compliance

## Action Categories

### Story Management
- `story.created` - New story created
- `story.updated` - Story content modified
- `story.deleted` - Story removed
- `story.published` - Story made public
- `story.unpublished` - Story hidden from public
- `story.suspended` - Story temporarily disabled

### User Management
- `user.created` - New user account created
- `user.updated` - User information modified
- `user.suspended` - User account suspended
- `user.banned` - User account permanently banned
- `user.unsuspended` - User account reactivated
- `user.deleted` - User account deleted

### System Configuration
- `system.config_updated` - System settings changed
- `system.feature_flag_changed` - Feature flags modified
- `system.maintenance_mode` - Maintenance mode toggled
- `system.backup_performed` - System backup completed

### Financial Operations
- `credits.adjusted` - User credits manually adjusted
- `transaction.reversed` - Credit transaction reversed
- `refund.processed` - Refund issued to user

### Achievement Management
- `achievement.created` - New achievement created
- `achievement.updated` - Achievement modified
- `achievement.deleted` - Achievement removed
- `achievement.granted` - Achievement manually granted to user

## Target Types

- **story**: Story-related actions (content, metadata, status)
- **user**: User account management actions
- **system**: System configuration and maintenance
- **finance**: Credit transactions and financial operations
- **achievement**: Achievement and avatar system management
- **review**: Content moderation actions
- **moderation**: Community moderation activities

## Key Indexes

```javascript
// Admin's action history - for performance review
db.AdminLogs.createIndex({ adminId: 1, timestamp: -1 });

// Target-specific queries - find actions on specific entities
db.AdminLogs.createIndex({ targetType: 1, target: 1 });

// Action type filtering - for specific activity monitoring
db.AdminLogs.createIndex({ action: 1 });

// Time-based queries - for reporting and analysis
db.AdminLogs.createIndex({ timestamp: -1 });

// Session tracking - for security investigations
db.AdminLogs.createIndex({ sessionId: 1 });
```

## Query Examples

### Get admin's recent activity
```javascript
db.AdminLogs.find({ adminId: ObjectId("admin_id") })
  .sort({ timestamp: -1 })
  .limit(50)
  .select({
    action: 1,
    target: 1,
    targetType: 1,
    timestamp: 1,
    changeDetails: 1
  });
```

### Get actions on specific target
```javascript
db.AdminLogs.find({
  targetType: "story",
  target: ObjectId("story_id")
})
  .sort({ timestamp: -1 })
  .populate('adminId', 'username role');
```

### Get audit trail for compliance
```javascript
db.AdminLogs.find({
  timestamp: {
    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // last 30 days
  },
  targetType: { $in: ["user", "finance"] }
})
  .sort({ timestamp: -1 })
  .populate('adminId', 'username email role');
```

### Create admin action log
```javascript
const adminLog = {
  adminId: ObjectId("admin_id"),
  adminName: "Admin User",
  role: "Story Editor",
  action: "story.updated",
  target: ObjectId("story_id"),
  targetType: "story",
  changeDetails: {
    before: {
      title: "Old Story Title",
      status: "draft"
    },
    after: {
      title: "New Story Title",
      status: "published"
    }
  },
  ip: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  sessionId: "session_12345",
  timestamp: new Date()
};

db.AdminLogs.create(adminLog);
```

### Get daily admin activity summary
```javascript
db.AdminLogs.aggregate([
  { $match: {
    timestamp: {
      $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // last 24 hours
    }
  }},
  { $group: {
    _id: {
      adminId: "$adminId",
      date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
    },
    totalActions: { $sum: 1 },
    actionBreakdown: {
      $push: {
        action: "$action",
        targetType: "$targetType",
        timestamp: "$timestamp"
      }
    }
  }},
  { $sort: { "_id.date": -1, totalActions: -1 } },
  { $lookup: {
    from: "AdminAccounts",
    localField: "_id.adminId",
    foreignField: "_id",
    as: "admin"
  }},
  { $unwind: "$admin" },
  { $project: {
    adminName: "$admin.username",
    adminRole: "$admin.role",
    date: "$_id.date",
    totalActions: 1,
    actionBreakdown: 1
  }}
]);
```

### Get high-risk actions for security review
```javascript
const highRiskActions = [
  "user.banned",
  "user.suspended",
  "credits.adjusted",
  "system.config_updated",
  "achievement.granted"
];

db.AdminLogs.find({
  action: { $in: highRiskActions },
  timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // last 7 days
})
  .sort({ timestamp: -1 })
  .populate('adminId', 'username email role');
```

### Track story status changes
```javascript
db.AdminLogs.aggregate([
  { $match: {
    targetType: "story",
    action: { $in: ["story.published", "story.unpublished", "story.suspended"] }
  }},
  { $group: {
    _id: "$target",
    statusHistory: {
      $push: {
        action: "$action",
        adminName: "$adminName",
        timestamp: "$timestamp",
        changeDetails: "$changeDetails"
      }
    }
  }},
  { $lookup: {
    from: "Stories",
    localField: "_id",
    foreignField: "_id",
    as: "story"
  }},
  { $unwind: "$story" },
  { $project: {
    storyTitle: "$story.title",
    currentStatus: "$story.moderation.status",
    statusHistory: 1
  }}
]);
```

## Change Details Tracking

### Before/After State Examples

#### Story Title Change
```javascript
{
  before: {
    title: "Original Story Title",
    description: "Original description",
    lastModified: "2024-01-01T10:00:00Z"
  },
  after: {
    title: "Updated Story Title",
    description: "Updated description",
    lastModified: "2024-01-01T11:00:00Z"
  }
}
```

#### User Status Change
```javascript
{
  before: {
    status: "active",
    accountStatus: {
      reason: null,
      moderatedBy: null
    }
  },
  after: {
    status: "suspended",
    accountStatus: {
      reason: "Violation of community guidelines",
      moderatedBy: ObjectId("admin_id")
    }
  }
}
```

#### Credit Adjustment
```javascript
{
  before: {
    credits: 100,
    lastTransaction: "txn_123"
  },
  after: {
    credits: 150,
    lastTransaction: "txn_124"
  }
}
```

## Integration Points

### AdminAccounts Collection
- Reference admin account information
- Role-based access validation
- Permission verification for actions

### SecurityEvents Collection
- Create security events for suspicious admin activity
- Correlate admin actions with security threats
- Automated monitoring and alerting

### System Monitoring
- Real-time admin activity dashboard
- Performance metrics collection
- Anomaly detection in admin behavior

## Security Considerations

### Immutable Records
- Once created, admin logs should never be modified
- Append-only architecture for audit integrity
- Cryptographic hashing for sensitive data
- Write-once, read-many storage strategy

### Access Control
- Restrict access to admin logs based on roles
- Audit log access itself should be logged
- Data retention policies compliance
- Secure transmission of log data

### Privacy Protection
- Sensitive data masking in logs
- PII encryption where required
- Configurable data retention periods
- Right to deletion compliance

## Compliance Features

### Regulatory Requirements
- GDPR compliance with audit trails
- SOX compliance for financial operations
- Industry-specific logging requirements
- Data residency considerations

### Audit Reports
- Daily/weekly/monthly activity summaries
- Specific action type reports
- Individual admin performance reports
- System change audit trails

## Performance Optimization

- **Efficient Indexing**: Optimized for common query patterns
- **Archival Strategy**: Move old logs to cold storage
- **Compression**: Compress historical log data
- **Query Optimization**: Efficient aggregation pipelines

## Analytics and Insights

### Admin Productivity
- Action completion rates
- Time spent per task type
- Error rates and corrections
- Peak activity periods

### System Usage Patterns
- Most common admin actions
- Target entity frequency
- Temporal usage patterns
- Workflow optimization opportunities

### Security Monitoring
- Unusual admin activity detection
- Privilege escalation monitoring
- After-hours access alerts
- Geographic access anomalies

## Backup and Recovery

### Log Preservation
- Immutable backup storage
- Geographic distribution
- Regular integrity checks
- Disaster recovery procedures

### Data Export
- CSV/JSON export capabilities
- Date range filtering
- Action type filtering
- Admin-specific exports

---

*Last updated: December 2024*