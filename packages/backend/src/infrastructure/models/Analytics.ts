import mongoose, { Document, Schema } from 'mongoose';

// Event type enum
export enum AnalyticsEventType {
  STORY_START = 'story_start',
  STORY_COMPLETE = 'story_complete',
  CHOICE = 'choice',
  ACHIEVEMENT_UNLOCK = 'achievement_unlock',
  STORY_VIEW = 'story_view',
  USER_ACTION = 'user_action',
  STORY_ABANDON = 'story_abandon',
  NODE_VIEW = 'node_view',
  LEVEL_UP = 'level_up',
  USER_REGISTER = 'user_register',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  PROFILE_UPDATE = 'profile_update',
  APP_START = 'app_start',
  FEATURE_USAGE = 'feature_usage',
  ERROR_OCCURRED = 'error_occurred',
  PERFORMANCE_ISSUE = 'performance_issue',
}

// Device type enum
export enum DeviceType {
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
  TABLET = 'tablet',
}

// Network type enum
export enum NetworkType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  ETHERNET = 'ethernet',
}

// Ending type enum
export enum EndingType {
  GOOD = 'good',
  BAD = 'bad',
  NEUTRAL = 'neutral',
  SECRET = 'secret',
}

// Interfaces
export interface IGeography {
  country: string;
  city?: string;
  timezone: string;
}

export interface IPerformance {
  loadTime?: number;
  responseTime?: number;
  errorCount?: number;
  networkType?: NetworkType;
}

export interface IMetadata {
  timeSpent?: number;
  pathTaken?: string[];
  endingType?: EndingType;
  deviceType: DeviceType;
  sessionId: string;
  referrer?: string;
  userAgent: string;
  language?: string;
  storyProgress?: number;
  userLevel?: number;
  choiceContext?: Record<string, unknown>;
  achievementDetails?: Record<string, unknown>;
  customProperties?: Record<string, unknown>;
}

export interface IAnalytics extends Document {
  eventType: AnalyticsEventType;
  userId?: mongoose.Types.ObjectId;
  storyId?: mongoose.Types.ObjectId;
  nodeId?: string;
  choiceId?: string;
  metadata: IMetadata;
  geography?: IGeography;
  performance?: IPerformance;
  timestamp: Date;
  createdAt: Date;
  processedAt: Date;
}

// Schema
const geographySchema = new Schema<IGeography>(
  {
    country: { type: String, required: true },
    city: { type: String },
    timezone: { type: String, required: true },
  },
  { _id: false }
);

const performanceSchema = new Schema<IPerformance>(
  {
    loadTime: { type: Number, min: 0 },
    responseTime: { type: Number, min: 0 },
    errorCount: { type: Number, min: 0, default: 0 },
    networkType: {
      type: String,
      enum: Object.values(NetworkType),
    },
  },
  { _id: false }
);

const metadataSchema = new Schema<IMetadata>(
  {
    timeSpent: { type: Number, min: 0 },
    pathTaken: [{ type: String }],
    endingType: {
      type: String,
      enum: Object.values(EndingType),
    },
    deviceType: {
      type: String,
      enum: Object.values(DeviceType),
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      maxlength: 100,
    },
    referrer: { type: String, maxlength: 500 },
    userAgent: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    language: { type: String, maxlength: 10 },
    storyProgress: {
      type: Number,
      min: 0,
      max: 100,
    },
    userLevel: { type: Number, min: 0 },
    choiceContext: { type: Schema.Types.Mixed },
    achievementDetails: { type: Schema.Types.Mixed },
    customProperties: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const analyticsSchema = new Schema<IAnalytics>(
  {
    eventType: {
      type: String,
      enum: Object.values(AnalyticsEventType),
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      sparse: true,
    },
    nodeId: {
      type: String,
      sparse: true,
      maxlength: 100,
    },
    choiceId: {
      type: String,
      sparse: true,
      maxlength: 100,
    },
    metadata: {
      type: metadataSchema,
      required: true,
    },
    geography: {
      type: geographySchema,
      sparse: true,
    },
    performance: {
      type: performanceSchema,
      sparse: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We use our own timestamp fields
  }
);

// Indexes
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ storyId: 1, timestamp: -1 });
analyticsSchema.index({ 'metadata.sessionId': 1 });
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL
analyticsSchema.index({ 'geography.country': 1, timestamp: -1 });
analyticsSchema.index({ 'performance.loadTime': 1 });
analyticsSchema.index({ eventType: 1, storyId: 1, userId: 1 });

// Compound indexes for complex queries
analyticsSchema.index({ userId: 1, eventType: 1, timestamp: -1 });
analyticsSchema.index({ storyId: 1, eventType: 1, timestamp: -1 });
analyticsSchema.index({ 'metadata.deviceType': 1, timestamp: -1 });

// Virtual for checking if this is a story event
analyticsSchema.virtual('isStoryEvent').get(function () {
  return [
    AnalyticsEventType.STORY_START,
    AnalyticsEventType.STORY_COMPLETE,
    AnalyticsEventType.STORY_VIEW,
    AnalyticsEventType.STORY_ABANDON,
    AnalyticsEventType.CHOICE,
    AnalyticsEventType.NODE_VIEW,
  ].includes(this.eventType);
});

// Virtual for checking if this is a user action
analyticsSchema.virtual('isUserAction').get(function () {
  return [
    AnalyticsEventType.USER_REGISTER,
    AnalyticsEventType.USER_LOGIN,
    AnalyticsEventType.USER_LOGOUT,
    AnalyticsEventType.PROFILE_UPDATE,
  ].includes(this.eventType);
});

// Virtual for event age
analyticsSchema.virtual('age').get(function () {
  return Date.now() - this.timestamp.getTime();
});

// Static methods
analyticsSchema.statics.getStoryEngagementMetrics = function (
  storyId: mongoose.Types.ObjectId,
  daysBack: number = 30
) {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        storyId: storyId,
        timestamp: { $gte: cutoffDate },
      },
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        avgTimeSpent: { $avg: '$metadata.timeSpent' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

analyticsSchema.statics.getUserBehaviorTimeline = function (
  userId: mongoose.Types.ObjectId,
  daysBack: number = 7
) {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  return this.find({
    userId: userId,
    timestamp: { $gte: cutoffDate },
  })
    .sort({ timestamp: -1 })
    .select({
      eventType: 1,
      storyId: 1,
      metadata: 1,
      timestamp: 1,
    });
};

analyticsSchema.statics.getStoryCompletionRate = function (
  storyId: mongoose.Types.ObjectId,
  daysBack: number = 30
) {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        eventType: { $in: [AnalyticsEventType.STORY_START, AnalyticsEventType.STORY_COMPLETE] },
        storyId: storyId,
        timestamp: { $gte: cutoffDate },
      },
    },
    {
      $group: {
        _id: '$eventType',
        uniqueUsers: { $addToSet: '$userId' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        starts: {
          $sum: { $cond: [{ $eq: ['$_id', AnalyticsEventType.STORY_START] }, '$count', 0] },
        },
        completions: {
          $sum: { $cond: [{ $eq: ['$_id', AnalyticsEventType.STORY_COMPLETE] }, '$count', 0] },
        },
        uniqueStarters: {
          $sum: {
            $cond: [
              { $eq: ['$_id', AnalyticsEventType.STORY_START] },
              { $size: '$uniqueUsers' },
              0,
            ],
          },
        },
        uniqueCompleters: {
          $sum: {
            $cond: [
              { $eq: ['$_id', AnalyticsEventType.STORY_COMPLETE] },
              { $size: '$uniqueUsers' },
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        completionRate: { $multiply: [{ $divide: ['$completions', '$starts'] }, 100] },
        uniqueCompletionRate: {
          $multiply: [{ $divide: ['$uniqueCompleters', '$uniqueStarters'] }, 100],
        },
        totalStarts: '$starts',
        totalCompletions: '$completions',
      },
    },
  ]);
};

analyticsSchema.statics.getDeviceUsageStats = function (hoursBack: number = 24) {
  const cutoffDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: cutoffDate },
      },
    },
    {
      $group: {
        _id: '$metadata.deviceType',
        totalEvents: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        eventTypes: { $addToSet: '$eventType' },
      },
    },
    { $sort: { totalEvents: -1 } },
  ]);
};

analyticsSchema.statics.getGeographicDistribution = function (daysBack: number = 7) {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        'geography.country': { $exists: true },
        timestamp: { $gte: cutoffDate },
      },
    },
    {
      $group: {
        _id: '$geography.country',
        totalEvents: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
      },
    },
    { $sort: { totalEvents: -1 } },
  ]);
};

analyticsSchema.statics.getRealTimeMetrics = function () {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  return Promise.all([
    // Active users in last hour
    this.aggregate([
      { $match: { timestamp: { $gte: oneHourAgo } } },
      { $group: { _id: null, uniqueUsers: { $addToSet: '$userId' } } },
      { $project: { activeUsers: { $size: '$uniqueUsers' } } },
    ]),

    // Story activity
    this.aggregate([
      {
        $match: {
          timestamp: { $gte: oneHourAgo },
          eventType: {
            $in: [
              AnalyticsEventType.STORY_START,
              AnalyticsEventType.STORY_COMPLETE,
              AnalyticsEventType.CHOICE,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          storyStarts: {
            $sum: { $cond: [{ $eq: ['$_id', AnalyticsEventType.STORY_START] }, '$count', 0] },
          },
          storyCompletions: {
            $sum: { $cond: [{ $eq: ['$_id', AnalyticsEventType.STORY_COMPLETE] }, '$count', 0] },
          },
          totalChoices: {
            $sum: { $cond: [{ $eq: ['$_id', AnalyticsEventType.CHOICE] }, '$count', 0] },
          },
        },
      },
    ]),

    // System health metrics
    this.aggregate([
      {
        $match: {
          timestamp: { $gte: oneHourAgo },
          'performance.loadTime': { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          avgLoadTime: { $avg: '$performance.loadTime' },
          avgResponseTime: { $avg: '$performance.responseTime' },
          totalErrors: { $sum: '$performance.errorCount' },
        },
      },
    ]),
  ]);
};

analyticsSchema.statics.createEvent = function (eventData: Partial<IAnalytics>) {
  return this.create({
    ...eventData,
    createdAt: new Date(),
    processedAt: new Date(),
  });
};

export const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);
