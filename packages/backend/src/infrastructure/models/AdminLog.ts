import mongoose, { Document, Schema } from 'mongoose';

// Action constants
export const ADMIN_ACTIONS = {
  // Story Management
  STORY_CREATED: 'story.created',
  STORY_UPDATED: 'story.updated',
  STORY_DELETED: 'story.deleted',
  STORY_PUBLISHED: 'story.published',
  STORY_UNPUBLISHED: 'story.unpublished',
  STORY_SUSPENDED: 'story.suspended',

  // User Management
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_SUSPENDED: 'user.suspended',
  USER_BANNED: 'user.banned',
  USER_UNSUSPENDED: 'user.unsuspended',
  USER_DELETED: 'user.deleted',

  // System Configuration
  SYSTEM_CONFIG_UPDATED: 'system.config_updated',
  SYSTEM_FEATURE_FLAG_CHANGED: 'system.feature_flag_changed',
  SYSTEM_MAINTENANCE_MODE: 'system.maintenance_mode',
  SYSTEM_BACKUP_PERFORMED: 'system.backup_performed',

  // Financial Operations
  CREDITS_ADJUSTED: 'credits.adjusted',
  TRANSACTION_REVERSED: 'transaction.reversed',
  REFUND_PROCESSED: 'refund.processed',

  // Achievement Management
  ACHIEVEMENT_CREATED: 'achievement.created',
  ACHIEVEMENT_UPDATED: 'achievement.updated',
  ACHIEVEMENT_DELETED: 'achievement.deleted',
  ACHIEVEMENT_GRANTED: 'achievement.granted',
} as const;

// Target type enum
export enum TargetType {
  STORY = 'story',
  USER = 'user',
  SYSTEM = 'system',
  FINANCE = 'finance',
  ACHIEVEMENT = 'achievement',
  REVIEW = 'review',
  MODERATION = 'moderation',
}

// High-risk actions for security monitoring
export const HIGH_RISK_ACTIONS = [
  ADMIN_ACTIONS.USER_BANNED,
  ADMIN_ACTIONS.USER_SUSPENDED,
  ADMIN_ACTIONS.CREDITS_ADJUSTED,
  ADMIN_ACTIONS.SYSTEM_CONFIG_UPDATED,
  ADMIN_ACTIONS.ACHIEVEMENT_GRANTED,
] as const;

// Interfaces
export interface IChangeDetails {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

export interface IAdminLog extends Document {
  adminId: mongoose.Types.ObjectId;
  adminName: string;
  role: string;
  action: string;
  target: string;
  targetType: TargetType;
  changeDetails?: IChangeDetails;
  ip: string;
  userAgent: string;
  sessionId: string;
  timestamp: Date;
}

// Schema
const changeDetailsSchema = new Schema<IChangeDetails>(
  {
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const adminLogSchema = new Schema<IAdminLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'AdminAccount',
      required: true,
    },
    adminName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    target: {
      type: String,
      required: true,
      maxlength: 100,
    },
    targetType: {
      type: String,
      enum: Object.values(TargetType),
      required: true,
    },
    changeDetails: {
      type: changeDetailsSchema,
    },
    ip: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          // Basic IPv4 and IPv6 validation
          return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(
            v
          );
        },
        message: 'Invalid IP address format',
      },
    },
    userAgent: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    sessionId: {
      type: String,
      required: true,
      maxlength: 100,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We use our own timestamp field
    collection: 'admin_logs',
  }
);

// Indexes
adminLogSchema.index({ adminId: 1, timestamp: -1 });
adminLogSchema.index({ targetType: 1, target: 1 });
adminLogSchema.index({ action: 1 });
adminLogSchema.index({ timestamp: -1 });
adminLogSchema.index({ sessionId: 1 });
adminLogSchema.index({ target: 1, timestamp: -1 });

// Compound indexes for complex queries
adminLogSchema.index({ targetType: 1, action: 1, timestamp: -1 });
adminLogSchema.index({ adminId: 1, targetType: 1, timestamp: -1 });
adminLogSchema.index({ action: 1, timestamp: -1 });

// Virtual for checking if this is a high-risk action
adminLogSchema.virtual('isHighRisk').get(function (this: IAdminLog) {
  return HIGH_RISK_ACTIONS.includes(this.action as (typeof HIGH_RISK_ACTIONS)[number]);
});

// Virtual for age of the log entry
adminLogSchema.virtual('age').get(function () {
  return Date.now() - this.timestamp.getTime();
});

// Static method to get admin's recent activity
adminLogSchema.statics.findRecentByAdmin = function (
  adminId: mongoose.Types.ObjectId,
  limit: number = 50
) {
  return this.find({ adminId }).sort({ timestamp: -1 }).limit(limit).select({
    action: 1,
    target: 1,
    targetType: 1,
    timestamp: 1,
    changeDetails: 1,
  });
};

// Static method to get actions on specific target
adminLogSchema.statics.findByTarget = function (targetType: TargetType, targetId: string) {
  return this.find({
    targetType,
    target: targetId,
  })
    .sort({ timestamp: -1 })
    .populate('adminId', 'username role');
};

// Static method to get audit trail for compliance
adminLogSchema.statics.getComplianceAuditTrail = function (
  daysBack: number = 30,
  targetTypes?: TargetType[]
) {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  const query: Record<string, unknown> = {
    timestamp: { $gte: cutoffDate },
  };

  if (targetTypes && targetTypes.length > 0) {
    query.targetType = { $in: targetTypes };
  } else {
    // Default to user and finance operations for compliance
    query.targetType = { $in: [TargetType.USER, TargetType.FINANCE] };
  }

  return this.find(query).sort({ timestamp: -1 }).populate('adminId', 'username email role');
};

// Static method to get daily admin activity summary
adminLogSchema.statics.getDailyActivitySummary = function (daysBack: number = 1) {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  return this.aggregate([
    { $match: { timestamp: { $gte: cutoffDate } } },
    {
      $group: {
        _id: {
          adminId: '$adminId',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        },
        totalActions: { $sum: 1 },
        actionBreakdown: {
          $push: {
            action: '$action',
            targetType: '$targetType',
            timestamp: '$timestamp',
          },
        },
      },
    },
    { $sort: { '_id.date': -1, totalActions: -1 } },
    {
      $lookup: {
        from: 'admin_accounts',
        localField: '_id.adminId',
        foreignField: '_id',
        as: 'admin',
      },
    },
    { $unwind: '$admin' },
    {
      $project: {
        adminName: '$admin.username',
        adminRole: '$admin.role',
        date: '$_id.date',
        totalActions: 1,
        actionBreakdown: 1,
      },
    },
  ]);
};

// Static method to get high-risk actions for security review
adminLogSchema.statics.getHighRiskActions = function (daysBack: number = 7) {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  return this.find({
    action: { $in: HIGH_RISK_ACTIONS },
    timestamp: { $gte: cutoffDate },
  })
    .sort({ timestamp: -1 })
    .populate('adminId', 'username email role');
};

// Static method to track story status changes
adminLogSchema.statics.getStoryStatusHistory = function () {
  return this.aggregate([
    {
      $match: {
        targetType: TargetType.STORY,
        action: {
          $in: [
            ADMIN_ACTIONS.STORY_PUBLISHED,
            ADMIN_ACTIONS.STORY_UNPUBLISHED,
            ADMIN_ACTIONS.STORY_SUSPENDED,
          ],
        },
      },
    },
    {
      $group: {
        _id: '$target',
        statusHistory: {
          $push: {
            action: '$action',
            adminName: '$adminName',
            timestamp: '$timestamp',
            changeDetails: '$changeDetails',
          },
        },
      },
    },
    {
      $lookup: {
        from: 'stories',
        localField: '_id',
        foreignField: '_id',
        as: 'story',
      },
    },
    { $unwind: '$story' },
    {
      $project: {
        storyTitle: '$story.title',
        currentStatus: '$story.moderation.status',
        statusHistory: 1,
      },
    },
  ]);
};

// Static method to create admin action log
adminLogSchema.statics.createLog = function (logData: Partial<IAdminLog>) {
  return this.create(logData);
};

// Static method to get action analytics
adminLogSchema.statics.getActionAnalytics = function (daysBack: number = 30) {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  return this.aggregate([
    { $match: { timestamp: { $gte: cutoffDate } } },
    {
      $group: {
        _id: {
          action: '$action',
          targetType: '$targetType',
        },
        count: { $sum: 1 },
        uniqueAdmins: { $addToSet: '$adminId' },
        lastOccurrence: { $max: '$timestamp' },
      },
    },
    { $sort: { count: -1 } },
    {
      $project: {
        action: '$_id.action',
        targetType: '$_id.targetType',
        count: 1,
        uniqueAdminCount: { $size: '$uniqueAdmins' },
        lastOccurrence: 1,
      },
    },
  ]);
};

export const AdminLog = mongoose.model<IAdminLog>('AdminLog', adminLogSchema);
