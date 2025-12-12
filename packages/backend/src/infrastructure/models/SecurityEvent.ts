import mongoose, { Document, HydratedDocument, Schema } from 'mongoose';

// Security event type enum
export enum SecurityEventType {
  FAILED_LOGIN = 'failed_login',
  MULTIPLE_FAILED_ATTEMPTS = 'multiple_failed_attempts',
  SUSPICIOUS_IP = 'suspicious_ip',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  DATA_BREACH_ATTEMPT = 'data_breach_attempt',
  ACCOUNT_LOCKOUT = 'account_lockout',
  SUSPICIOUS_LOGIN = 'suspicious_login',
  ROLE_VIOLATION = 'role_violation',
  ADMIN_IMPERSONATION = 'admin_impersonation',
  SESSION_HIJACKING = 'session_hijacking',
  API_ABUSE = 'api_abuse',
  DATA_EXFILTRATION = 'data_exfiltration',
  SQL_INJECTION = 'sql_injection',
  DENIAL_OF_SERVICE = 'denial_of_service',
  MALICIOUS_PAYLOAD = 'malicious_payload',
  VULNERABILITY_SCAN = 'vulnerability_scan',
  BRUTE_FORCE = 'brute_force',
}

// Security severity enum
export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Security status enum
export enum SecurityStatus {
  DETECTED = 'detected',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
}

// Action taken enum
export enum SecurityAction {
  NONE = 'none',
  ACCOUNT_LOCKED = 'account_locked',
  IP_BLOCKED = 'ip_blocked',
  ADMIN_NOTIFIED = 'admin_notified',
  SESSION_TERMINATED = 'session_terminated',
}

// Interfaces
export interface IEventDetails {
  loginAttempts?: number;
  timeWindow?: number;
  ipAddress?: string;
  userAgent?: string;
  riskScore?: number;
  targetResource?: string;
  additionalData?: Record<string, unknown>;
}

export interface IActionDetails {
  lockDuration?: number;
  autoUnlockAt?: Date;
  requiresManualReview?: boolean;
  notifiedAdmins?: mongoose.Types.ObjectId[];
}

export interface ISecurityEvent extends Document {
  userId?: mongoose.Types.ObjectId;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  status: SecurityStatus;
  description: string;
  eventDetails: IEventDetails;
  actionTaken: SecurityAction;
  actionDetails: IActionDetails;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  resolutionNotes?: string;
  timestamp: Date;
  isActive?: boolean;
  requiresAttention?: boolean;
}

// Schema
const eventDetailsSchema = new Schema<IEventDetails>(
  {
    loginAttempts: { type: Number, min: 0 },
    timeWindow: { type: Number, min: 0 },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    riskScore: { type: Number, min: 0, max: 100 },
    targetResource: { type: String, trim: true },
    additionalData: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const actionDetailsSchema = new Schema<IActionDetails>(
  {
    lockDuration: { type: Number, min: 0 },
    autoUnlockAt: { type: Date },
    requiresManualReview: { type: Boolean, default: false },
    notifiedAdmins: [{ type: Schema.Types.ObjectId, ref: 'AdminAccount' }],
  },
  { _id: false }
);

const securityEventSchema = new Schema<ISecurityEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
    eventType: {
      type: String,
      enum: Object.values(SecurityEventType),
      required: true,
    },
    severity: {
      type: String,
      enum: Object.values(SecuritySeverity),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SecurityStatus),
      required: true,
      default: SecurityStatus.DETECTED,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    eventDetails: {
      type: eventDetailsSchema,
      required: true,
    },
    actionTaken: {
      type: String,
      enum: Object.values(SecurityAction),
      required: true,
      default: SecurityAction.NONE,
    },
    actionDetails: {
      type: actionDetailsSchema,
      required: true,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminAccount',
    },
    resolvedAt: { type: Date },
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: 'security_events',
  }
);

// Indexes
securityEventSchema.index({ eventType: 1, timestamp: -1 });
securityEventSchema.index({ severity: 1, status: 1 });
securityEventSchema.index({ userId: 1, timestamp: -1 });
securityEventSchema.index({ status: 1, timestamp: 1 });
securityEventSchema.index({ resolvedAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 years
securityEventSchema.index({ 'eventDetails.ipAddress': 1 });
securityEventSchema.index({ 'eventDetails.riskScore': -1 });
securityEventSchema.index({ timestamp: -1 });

// Middleware
securityEventSchema.pre('save', function (this: HydratedDocument<ISecurityEvent>) {
  if (this.isModified('resolvedAt') && this.resolvedAt && !this.resolvedBy) {
    this.resolvedBy = undefined; // Ensure resolvedBy is set when resolvedAt is set
  }
});

// Virtual for checking if event is active (not resolved)
securityEventSchema.virtual('isActive').get(function () {
  return this.status === SecurityStatus.DETECTED || this.status === SecurityStatus.INVESTIGATING;
});

// Virtual for checking if event requires attention
securityEventSchema.virtual('requiresAttention').get(function () {
  return (
    this.isActive &&
    (this.severity === SecuritySeverity.HIGH || this.severity === SecuritySeverity.CRITICAL) &&
    this.actionDetails.requiresManualReview
  );
});

// Static method to find active threats
securityEventSchema.statics.findActiveThreats = function () {
  return this.find({
    status: { $in: [SecurityStatus.DETECTED, SecurityStatus.INVESTIGATING] },
    severity: { $in: [SecuritySeverity.HIGH, SecuritySeverity.CRITICAL] },
  })
    .sort({ 'eventDetails.riskScore': -1, timestamp: -1 })
    .populate('userId', 'username email profile.displayName')
    .populate('resolvedBy', 'username email profile.displayName');
};

// Static method to find events by user
securityEventSchema.statics.findByUser = function (userId: mongoose.Types.ObjectId, limit = 20) {
  return this.find({ userId }).sort({ timestamp: -1 }).limit(limit).select({
    eventType: 1,
    severity: 1,
    status: 1,
    description: 1,
    timestamp: 1,
    'eventDetails.riskScore': 1,
  });
};

// Static method to find events by IP address
securityEventSchema.statics.findByIP = function (ipAddress: string, timeWindow = 24) {
  const cutoffDate = new Date(Date.now() - timeWindow * 60 * 60 * 1000);
  return this.find({
    'eventDetails.ipAddress': ipAddress,
    timestamp: { $gte: cutoffDate },
  }).sort({ timestamp: -1 });
};

// Static method to get security dashboard statistics
securityEventSchema.statics.getDashboardStats = function (timeWindow = 24) {
  const cutoffDate = new Date(Date.now() - timeWindow * 60 * 60 * 1000);

  return this.aggregate([
    { $match: { timestamp: { $gte: cutoffDate } } },
    {
      $group: {
        _id: {
          eventType: '$eventType',
          severity: '$severity',
        },
        count: { $sum: 1 },
        activeCount: {
          $sum: {
            $cond: [
              { $in: ['$status', [SecurityStatus.DETECTED, SecurityStatus.INVESTIGATING]] },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $group: {
        _id: '$_id.eventType',
        severities: {
          $push: {
            severity: '$_id.severity',
            count: '$count',
            activeCount: '$activeCount',
          },
        },
        totalCount: { $sum: '$count' },
      },
    },
    { $sort: { totalCount: -1 } },
  ]);
};

// Method to resolve event
securityEventSchema.methods.resolve = function (
  resolvedBy: mongoose.Types.ObjectId,
  resolutionNotes?: string
) {
  this.status = SecurityStatus.RESOLVED;
  this.resolvedBy = resolvedBy;
  this.resolvedAt = new Date();
  if (resolutionNotes) {
    this.resolutionNotes = resolutionNotes;
  }
  return this.save();
};

// Method to mark as false positive
securityEventSchema.methods.markAsFalsePositive = function (
  resolvedBy: mongoose.Types.ObjectId,
  resolutionNotes?: string
) {
  this.status = SecurityStatus.FALSE_POSITIVE;
  this.resolvedBy = resolvedBy;
  this.resolvedAt = new Date();
  if (resolutionNotes) {
    this.resolutionNotes = resolutionNotes;
  }
  return this.save();
};

export const SecurityEvent = mongoose.model<ISecurityEvent>('SecurityEvent', securityEventSchema);
