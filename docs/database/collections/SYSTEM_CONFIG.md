# SystemConfig Collection

## Purpose

Centralized system configuration and feature flags for runtime configuration management, allowing dynamic control of TalePick platform behavior without code deployment.

## Schema

```javascript
{
  _id: ObjectId,
  key: String,                // unique identifier for the configuration
  value: Mixed,               // can be number, string, boolean, object, array
  description: String,        // human-readable description of the configuration
  category: String,           // 'game' | 'security' | 'payment' | 'feature' | 'ui'
  isPublic: Boolean,          // can be accessed by frontend applications

  // Audit Trail
  lastModifiedBy: ObjectId,   // admin user ID who last modified this config
  lastModifiedAt: Date,       // when the configuration was last modified

  // Version Control
  version: Number,            // configuration version for change tracking

  // Validation Rules
  validation: {
    type: String,             // 'string' | 'number' | 'boolean' | 'object' | 'array'
    required: Boolean,        // whether this configuration is required
    min: Number,             // minimum value for numbers
    max: Number,             // maximum value for numbers
    allowedValues: [Mixed]   // list of allowed values
  },

  createdAt: Date,
  updatedAt: Date
}
```

## Key Features

- **Dynamic Configuration**: Runtime system configuration without code changes
- **Feature Flags**: Enable/disable features dynamically
- **Frontend Access**: Public configurations available to client applications
- **Audit Trail**: Complete modification history and accountability
- **Validation**: Type checking and value validation for configuration integrity
- **Categorization**: Organized configuration groups for easy management

## Configuration Categories

### Game Settings
Platform game mechanics and user experience configurations.

### Security
Security policies, authentication rules, and threat detection settings.

### Payment
Credit system, transactions, and financial operations settings.

### Feature
Feature flags for enabling/disabling platform capabilities.

### UI
User interface settings, display preferences, and presentation options.

## Default System Configurations

### Game Settings
```javascript
[
  {
    key: "CREDIT_REFILL_INTERVAL",
    value: 300000,
    description: "Credit refill interval in milliseconds (5 minutes)",
    category: "game",
    isPublic: true,
    validation: {
      type: "number",
      required: true,
      min: 60000,
      max: 3600000
    }
  },
  {
    key: "DEFAULT_MAX_CREDITS",
    value: 100,
    description: "Starting maximum credit limit for new users",
    category: "game",
    isPublic: true,
    validation: {
      type: "number",
      required: true,
      min: 10,
      max: 1000
    }
  },
  {
    key: "CHOICE_COST",
    value: 1,
    description: "Credits required per story choice",
    category: "game",
    isPublic: true,
    validation: {
      type: "number",
      required: true,
      min: 1,
      max: 10
    }
  },
  {
    key: "REVIEW_BONUS_CREDITS",
    value: 5,
    description: "Bonus credits awarded for first review on a story",
    category: "game",
    isPublic: true,
    validation: {
      type: "number",
      required: true,
      min: 0,
      max: 50
    }
  },
  {
    key: "CREDIT_AUTO_REFILL_ENABLED",
    value: true,
    description: "Enable automatic credit refill system",
    category: "game",
    isPublic: true,
    validation: {
      type: "boolean",
      required: true
    }
  }
]
```

### Security Settings
```javascript
[
  {
    key: "OTP_EXPIRE_MINUTES",
    value: 10,
    description: "OTP code validity duration in minutes",
    category: "security",
    isPublic: false,
    validation: {
      type: "number",
      required: true,
      min: 5,
      max: 60
    }
  },
  {
    key: "OTP_MAX_ATTEMPTS",
    value: 3,
    description: "Maximum failed OTP attempts before code expires",
    category: "security",
    isPublic: false,
    validation: {
      type: "number",
      required: true,
      min: 1,
      max: 10
    }
  },
  {
    key: "FAILED_LOGIN_LOCK_THRESHOLD",
    value: 5,
    description: "Failed login attempts before account lock",
    category: "security",
    isPublic: false,
    validation: {
      type: "number",
      required: true,
      min: 3,
      max: 20
    }
  },
  {
    key: "SESSION_TIMEOUT_MINUTES",
    value: 10080,
    description: "User session timeout in minutes (7 days)",
    category: "security",
    isPublic: false,
    validation: {
      type: "number",
      required: true,
      min: 30,
      max: 43200
    }
  }
]
```

### Feature Flags
```javascript
[
  {
    key: "SOCIAL_SHARING_ENABLED",
    value: true,
    description: "Enable social media sharing features",
    category: "feature",
    isPublic: true,
    validation: {
      type: "boolean",
      required: true
    }
  },
  {
    key: "ACHIEVEMENT_SYSTEM_ENABLED",
    value: true,
    description: "Enable user achievement system",
    category: "feature",
    isPublic: true,
    validation: {
      type: "boolean",
      required: true
    }
  },
  {
    key: "STORY_COMMENTS_ENABLED",
    value: false,
    description: "Enable story comments and discussions",
    category: "feature",
    isPublic: true,
    validation: {
      type: "boolean",
      required: true
    }
  },
  {
    key: "MULTIPLAYER_ENABLED",
    value: false,
    description: "Enable multiplayer story experiences",
    category: "feature",
    isPublic: true,
    validation: {
      type: "boolean",
      required: true
    }
  }
]
```

### Content Moderation
```javascript
[
  {
    key: "AUTO_MODERATION_ENABLED",
    value: true,
    description: "Enable AI-powered content moderation",
    category: "feature",
    isPublic: false,
    validation: {
      type: "boolean",
      required: true
    }
  },
  {
    key: "REVIEW_AUTO_APPROVE_THRESHOLD",
    value: 4,
    description: "Rating threshold for automatic review approval",
    category: "feature",
    isPublic: false,
    validation: {
      type: "number",
      required: true,
      min: 1,
      max: 5
    }
  },
  {
    key: "CONTENT_REPORT_REVIEW_REQUIRED",
    value: 3,
    description: "Number of reports before content review is required",
    category: "security",
    isPublic: false,
    validation: {
      type: "number",
      required: true,
      min: 1,
      max: 10
    }
  }
]
```

## Key Indexes

```javascript
// Unique key lookup - primary configuration access
db.SystemConfig.createIndex({ key: 1 }, { unique: true });

// Category-based filtering - management interface
db.SystemConfig.createIndex({ category: 1 });

// Public configuration access - frontend API
db.SystemConfig.createIndex({ isPublic: 1 });

// Modification tracking - audit and monitoring
db.SystemConfig.createIndex({ lastModifiedAt: 1 });

// Search functionality - find configurations
db.SystemConfig.createIndex({ description: "text" });
```

## Query Examples

### Get all public configurations for frontend
```javascript
db.SystemConfig.find(
  { isPublic: true },
  { key: 1, value: 1, description: 1, category: 1 }
)
  .sort({ category: 1, key: 1 });
```

### Get specific configuration value
```javascript
db.SystemConfig.findOne(
  { key: "DEFAULT_MAX_CREDITS" },
  { value: 1, description: 1, lastModifiedAt: 1 }
);
```

### Get configurations by category
```javascript
db.SystemConfig.find({ category: "game" })
  .sort({ key: 1 })
  .select({ key: 1, value: 1, description: 1, isPublic: 1 });
```

### Update configuration with audit trail
```javascript
db.SystemConfig.updateOne(
  { key: "CREDIT_REFILL_INTERVAL" },
  {
    $set: {
      value: 240000, // 4 minutes
      description: "Reduced from 5 minutes for testing",
      lastModifiedBy: ObjectId("admin_id"),
      lastModifiedAt: new Date(),
      version: { $inc: 1 }
    }
  }
);
```

### Create new configuration
```javascript
const newConfig = {
  key: "NEW_FEATURE_FLAG",
  value: true,
  description: "Enable new experimental feature",
  category: "feature",
  isPublic: true,
  lastModifiedBy: ObjectId("admin_id"),
  lastModifiedAt: new Date(),
  version: 1,
  validation: {
    type: "boolean",
    required: true
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

db.SystemConfig.create(newConfig);
```

### Validate configuration value before update
```javascript
const validateConfigValue = async (key, newValue) => {
  const config = await db.SystemConfig.findOne({ key });

  if (!config) {
    throw new Error(`Configuration ${key} not found`);
  }

  const { validation } = config;

  // Type validation
  if (validation.type === 'number' && typeof newValue !== 'number') {
    throw new Error('Value must be a number');
  }

  if (validation.type === 'boolean' && typeof newValue !== 'boolean') {
    throw new Error('Value must be boolean');
  }

  if (validation.type === 'string' && typeof newValue !== 'string') {
    throw new Error('Value must be a string');
  }

  // Range validation
  if (validation.type === 'number') {
    if (validation.min !== undefined && newValue < validation.min) {
      throw new Error(`Value must be at least ${validation.min}`);
    }
    if (validation.max !== undefined && newValue > validation.max) {
      throw new Error(`Value must be no more than ${validation.max}`);
    }
  }

  // Allowed values validation
  if (validation.allowedValues && !validation.allowedValues.includes(newValue)) {
    throw new Error(`Value must be one of: ${validation.allowedValues.join(', ')}`);
  }

  return true;
};
```

### Get configuration change history
```javascript
// This would require implementing a configuration history collection
// or using a change tracking mechanism

const getRecentConfigChanges = async () => {
  return await db.SystemConfig.find({
    lastModifiedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // last 7 days
  })
  .sort({ lastModifiedAt: -1 })
  .populate('lastModifiedBy', 'username email')
  .select({
    key: 1,
    value: 1,
    description: 1,
    category: 1,
    lastModifiedBy: 1,
    lastModifiedAt: 1,
    version: 1
  });
};
```

### Bulk configuration operations
```javascript
const updateMultipleConfigs = async (updates, adminId) => {
  const bulkOps = updates.map(update => ({
    updateOne: {
      filter: { key: update.key },
      update: {
        $set: {
          value: update.value,
          lastModifiedBy: adminId,
          lastModifiedAt: new Date(),
          $inc: { version: 1 }
        }
      }
    }
  }));

  return await db.SystemConfig.bulkWrite(bulkOps);
};
```

## Configuration Management

### Environment-specific Configurations
```javascript
const getEnvironmentConfigs = (environment) => {
  const overrides = {
    development: {
      "CREDIT_REFILL_INTERVAL": 60000, // 1 minute for testing
      "DEBUG_MODE": true,
      "LOG_LEVEL": "debug"
    },
    staging: {
      "CREDIT_REFILL_INTERVAL": 120000, // 2 minutes
      "DEBUG_MODE": false,
      "LOG_LEVEL": "info"
    },
    production: {
      "CREDIT_REFILL_INTERVAL": 300000, // 5 minutes
      "DEBUG_MODE": false,
      "LOG_LEVEL": "error"
    }
  };

  return overrides[environment] || {};
};
```

### Configuration Export/Import
```javascript
const exportConfigurations = async (category = null) => {
  const filter = category ? { category } : {};

  const configs = await db.SystemConfig.find(filter)
    .sort({ category: 1, key: 1 })
    .select({ key: 1, value: 1, description: 1, category: 1, validation: 1 });

  return {
    exportedAt: new Date(),
    exportedBy: "system",
    configurations: configs
  };
};

const importConfigurations = async (configData, adminId) => {
  const results = {
    imported: 0,
    updated: 0,
    errors: []
  };

  for (const config of configData.configurations) {
    try {
      const existing = await db.SystemConfig.findOne({ key: config.key });

      if (existing) {
        await db.SystemConfig.updateOne(
          { key: config.key },
          {
            $set: {
              value: config.value,
              description: config.description,
              lastModifiedBy: adminId,
              lastModifiedAt: new Date(),
              $inc: { version: 1 }
            }
          }
        );
        results.updated++;
      } else {
        await db.SystemConfig.create({
          ...config,
          lastModifiedBy: adminId,
          lastModifiedAt: new Date(),
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        results.imported++;
      }
    } catch (error) {
      results.errors.push({
        key: config.key,
        error: error.message
      });
    }
  }

  return results;
};
```

## Integration Points

### AdminLogs Collection
- Log all configuration changes
- Track which admin made changes
- Maintain audit trail for compliance

### Frontend Applications
- Public configurations available via API
- Feature flag implementation
- Dynamic behavior based on config

### Backend Services
- Runtime behavior modification
- Feature toggles for A/B testing
- System parameters adjustment

### Analytics Collection
- Track configuration usage
- Monitor feature flag effectiveness
- Measure system performance impact

## Performance Optimization

- **Caching Layer**: Cache frequently accessed configurations
- **Efficient Indexing**: Fast lookups for configuration access
- **Bulk Operations**: Efficient configuration management
- **Memory Management**: Keep configuration dataset reasonable

## Security Considerations

- **Access Control**: Role-based configuration modification permissions
- **Validation**: Comprehensive input validation
- **Audit Trail**: Complete change tracking
- **Sensitive Data**: Protect sensitive configurations from public access

## Analytics and Monitoring

### Configuration Usage
- Most frequently accessed configurations
- Feature flag usage statistics
- Configuration change frequency
- Performance impact of changes

### System Health
- Configuration validation failures
- Invalid configuration attempts
- System performance by configuration
- Error rates by configuration

---

*Last updated: December 2024*