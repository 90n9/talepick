# OTPCodes Collection

## Purpose

OTP (One-Time Password) verification with rate limiting and security features for secure email-based authentication flows on the TalePick platform.

## Schema

```javascript
{
  _id: ObjectId,
  email: String,              // email address for OTP verification (indexed for lookup)
  code: String,               // 6-digit OTP code
  type: String,               // 'registration' | 'password_reset' | 'login_verification'
  userId: ObjectId,           // references Users (optional for registration)

  // Attempt Tracking
  attempts: Number,           // current number of attempts made
  maxAttempts: Number,        // maximum allowed attempts (usually 3)

  // Status Tracking
  usedAt: Date,               // when OTP was successfully used (null until then)

  // Timestamps
  createdAt: Date,            // when OTP was generated
  expiresAt: Date,            // when OTP expires (usually 10 minutes)

  // Request Context
  ipAddress: String,          // IP address of request
  userAgent: String,          // browser/device information

  // Metadata
  metadata: {
    username: String,         // username for registration OTPs
    passwordHash: String,     // password hash for registration OTPs
    displayName: String,      // display name for registration OTPs
    source: String            // application source (web, mobile)
  }
}
```

## Key Features

- **Secure Code Generation**: Cryptographically secure 6-digit codes
- **Rate Limiting**: Comprehensive rate limiting to prevent abuse
- **Flexible Usage**: Support for registration, password reset, and login verification
- **Security Monitoring**: IP-based tracking and attempt monitoring
- **Automatic Cleanup**: TTL-based automatic cleanup of expired codes

## OTP Types

### Registration
- Used for new user account verification
- Contains user registration data in metadata
- Requires email verification before account activation

### Password Reset
- Used for secure password reset flow
- Validates user email ownership
- High security due to sensitive nature

### Login Verification
- Additional security layer for suspicious logins
- Step-up authentication for high-risk actions
- Geographic anomaly verification

## Security Features

### Rate Limiting Rules
- **Per Email**: 5 OTP requests per hour maximum
- **Per IP**: 20 OTP requests per hour maximum
- **Resend Cooldown**: 60 seconds between resend requests
- **Attempt Limit**: Maximum 3 failed attempts per OTP
- **Auto Cleanup**: 24-hour TTL for all OTP documents

### Code Security
- **Cryptographically Secure**: Uses crypto.randomBytes()
- **6-Digit Format**: Easy to type, no ambiguous characters
- **One-Time Use**: Codes become invalid after successful use
- **Time-Bound**: Default 10-minute expiration

## Key Indexes

```javascript
// Primary lookup - email and type combination
db.OTPCodes.createIndex({ email: 1, type: 1, usedAt: 1 }, { sparse: true });

// Code validation - code with expiration
db.OTPCodes.createIndex({ code: 1, expiresAt: 1 }, { expireAfterSeconds: 0 });

// User lookup - find OTPs by user
db.OTPCodes.createIndex({ userId: 1 }, { sparse: true });

// Automatic cleanup - remove expired codes
db.OTPCodes.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Rate limiting - track requests by email and time
db.OTPCodes.createIndex({ email: 1, createdAt: 1 });
```

## Query Examples

### Create new OTP
```javascript
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const newOTP = {
  email: "user@example.com",
  code: generateOTP(),
  type: "registration",
  attempts: 0,
  maxAttempts: 3,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  metadata: {
    username: "newuser",
    passwordHash: "hashed_password",
    displayName: "New User",
    source: "web"
  }
};

db.OTPCodes.create(newOTP);
```

### Validate OTP
```javascript
db.OTPCodes.findOne({
  email: "user@example.com",
  code: "123456",
  type: "registration",
  usedAt: null,
  expiresAt: { $gt: new Date() },
  attempts: { $lt: 3 }
});
```

### Check rate limiting before generating new OTP
```javascript
const checkRateLimit = async (email, type) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentOTPs = await db.OTPCodes.countDocuments({
    email: email,
    type: type,
    createdAt: { $gte: oneHourAgo }
  });

  if (recentOTPs >= 5) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }
};
```

### Mark OTP as used
```javascript
db.OTPCodes.updateOne(
  { _id: ObjectId("otp_id") },
  {
    $set: { usedAt: new Date() }
  }
);
```

### Increment failed attempt
```javascript
const result = await db.OTPCodes.updateOne(
  { _id: ObjectId("otp_id"), attempts: { $lt: 3 } },
  {
    $inc: { attempts: 1 }
  }
);

if (result.matchedCount === 0) {
  throw new Error("Maximum attempts exceeded");
}
```

### Get recent OTPs for monitoring
```javascript
db.OTPCodes.find({
  createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // last hour
})
  .sort({ createdAt: -1 })
  .select({
    email: 1,
    type: 1,
    attempts: 1,
    ipAddress: 1,
    createdAt: 1,
    usedAt: 1
  });
```

### Clean up expired OTPs (manual cleanup if needed)
```javascript
const cleanupResult = await db.OTPCodes.deleteMany({
  expiresAt: { $lt: new Date() }
});
```

### Get OTP usage statistics
```javascript
db.OTPCodes.aggregate([
  { $match: {
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // last 24 hours
  }},
  { $group: {
    _id: "$type",
    totalGenerated: { $sum: 1 },
    totalUsed: {
      $sum: { $cond: [{ $ne: ["$usedAt", null] }, 1, 0] }
    },
    totalExpired: {
      $sum: { $cond: [{ $and: [
        { $eq: ["$usedAt", null] },
        { $lt: ["$expiresAt", new Date()] }
      ]}, 1, 0] }
    },
    averageAttempts: { $avg: "$attempts" }
  }},
  { $sort: { totalGenerated: -1 } }
]);
```

### Detect potential OTP abuse
```javascript
db.OTPCodes.aggregate([
  { $match: {
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // last hour
  }},
  { $group: {
    _id: "$ipAddress",
    totalRequests: { $sum: 1 },
    uniqueEmails: { $addToSet: "$email" },
    types: { $addToSet: "$type" }
  }},
  { $match: {
    $or: [
      { totalRequests: { $gt: 20 } },
      { $expr: { $gt: [{ $size: "$uniqueEmails" }, 10] } }
    ]
  }},
  { $sort: { totalRequests: -1 } }
]);
```

## OTP Generation Process

### Secure Code Generation
```javascript
const crypto = require('crypto');

const generateSecureOTP = () => {
  // Generate cryptographically secure 6-digit code
  const buffer = crypto.randomBytes(4);
  const code = buffer.readUInt32BE(0) % 1000000;
  return code.toString().padStart(6, '0');
};
```

### Registration OTP Creation
```javascript
const createRegistrationOTP = async (userData, ipAddress, userAgent) => {
  // Check rate limits first
  await checkRateLimit(userData.email, 'registration');

  // Generate OTP
  const code = generateSecureOTP();

  // Store OTP with user data
  const otp = await db.OTPCodes.create({
    email: userData.email,
    code: code,
    type: 'registration',
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    ipAddress: ipAddress,
    userAgent: userAgent,
    metadata: {
      username: userData.username,
      passwordHash: userData.passwordHash,
      displayName: userData.displayName,
      source: userData.source
    }
  });

  // Send email (this would integrate with email service)
  await sendOTPEmail(userData.email, code, 'registration');

  return otp;
};
```

### Password Reset OTP Creation
```javascript
const createPasswordResetOTP = async (email, ipAddress, userAgent) => {
  // Check if user exists
  const user = await db.Users.findOne({ email });
  if (!user) {
    // Still create OTP to prevent email enumeration
    // But don't link to user
  }

  await checkRateLimit(email, 'password_reset');

  const code = generateSecureOTP();

  const otp = await db.OTPCodes.create({
    email: email,
    code: code,
    type: 'password_reset',
    userId: user?._id,
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    ipAddress: ipAddress,
    userAgent: userAgent
  });

  await sendOTPEmail(email, code, 'password_reset');

  return otp;
};
```

## Email Integration

### Email Templates
```javascript
const getEmailTemplate = (type, code) => {
  const templates = {
    registration: {
      subject: 'Verify your TalePick account',
      body: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`
    },
    password_reset: {
      subject: 'Reset your TalePick password',
      body: `Your password reset code is: ${code}\n\nThis code will expire in 10 minutes.`
    },
    login_verification: {
      subject: 'Verify your TalePick login',
      body: `Your login verification code is: ${code}\n\nThis code will expire in 10 minutes.`
    }
  };

  return templates[type];
};
```

### Email Sending Service
```javascript
const sendOTPEmail = async (email, code, type) => {
  const template = getEmailTemplate(type, code);

  // Integration with email service (SendGrid, AWS SES, etc.)
  const emailData = {
    to: email,
    subject: template.subject,
    text: template.body,
    html: template.body.replace('\n', '<br>')
  };

  return await emailService.send(emailData);
};
```

## Security Monitoring

### Suspicious Activity Detection
```javascript
const detectSuspiciousOTPActivity = async () => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // High volume from single IP
  const ipAbuse = await db.OTPCodes.aggregate([
    { $match: { createdAt: { $gte: oneHourAgo } } },
    { $group: {
      _id: "$ipAddress",
      requestCount: { $sum: 1 },
      uniqueEmails: { $addToSet: "$email" }
    }},
    { $match: { requestCount: { $gt: 20 } } }
  ]);

  // High volume for single email
  const emailAbuse = await db.OTPCodes.aggregate([
    { $match: { createdAt: { $gte: oneHourAgo } } },
    { $group: {
      _id: "$email",
      requestCount: { $sum: 1 },
      uniqueIPs: { $addToSet: "$ipAddress" }
    }},
    { $match: { requestCount: { $gt: 5 } } }
  ]);

  if (ipAbuse.length > 0 || emailAbuse.length > 0) {
    await createSecurityEvent({
      eventType: "otp_abuse_detected",
      severity: "medium",
      eventDetails: {
        ipAbuse: ipAbuse,
        emailAbuse: emailAbuse
      }
    });
  }
};
```

### Failure Pattern Analysis
```javascript
const analyzeOTPFailures = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const failureAnalysis = await db.OTPCodes.aggregate([
    { $match: {
      createdAt: { $gte: oneDayAgo },
      attempts: { $gte: 2 }
    }},
    { $group: {
      _id: "$ipAddress",
      totalFailed: { $sum: 1 },
      emails: { $addToSet: "$email" }
    }},
    { $match: { totalFailed: { $gte: 10 } } }
  ]);

  return failureAnalysis;
};
```

## Integration Points

### Users Collection
- Link OTP codes to user accounts
- Trigger account creation after successful verification
- Handle password reset after verification

### SecurityEvents Collection
- Create security events for OTP abuse
- Monitor suspicious OTP patterns
- Automated threat response integration

### UserSessions Collection
- Create user sessions after successful OTP verification
- Link OTP verification to session creation

### Analytics Collection
- Track OTP generation and usage patterns
- Monitor conversion rates for registration
- Analyze security metrics

## Performance Optimization

- **Efficient Indexing**: Fast OTP lookup and validation
- **TTL Cleanup**: Automatic removal of expired codes
- **Memory Management**: Prevent unbounded growth
- **Rate Limiting**: Database-level abuse prevention

## Compliance and Security

### Data Protection
- No PII storage beyond email address
- Automatic cleanup of expired codes
- Secure code generation methods
- Rate limiting and abuse prevention

### Compliance Features
- GDPR-compliant data handling
- Audit trail for OTP usage
- Secure transmission of codes
- Access logging and monitoring

---

*Last updated: December 2024*