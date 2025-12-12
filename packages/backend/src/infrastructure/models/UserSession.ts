import mongoose, { Document, Schema } from 'mongoose';

// Auth method enum
export enum UserAuthMethod {
  EMAIL = 'email',
  GOOGLE = 'google',
  GUEST = 'guest',
}

// Platform enum
export enum UserPlatform {
  WEB = 'web',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
}

// Browser enum
export enum UserBrowser {
  CHROME = 'chrome',
  FIREFOX = 'firefox',
  SAFARI = 'safari',
  EDGE = 'edge',
  OTHER = 'other',
}

// OAuth provider enum
export enum OAuthProvider {
  GOOGLE = 'google',
}

// Interfaces
export interface IDeviceInfo {
  userAgent: string;
  platform: UserPlatform;
  browser: UserBrowser;
  ip: string;
}

export interface IAuthentication {
  authMethod: UserAuthMethod;
  oauthProvider?: OAuthProvider;
  oauthAccessToken?: string;
  oauthRefreshToken?: string;
  oauthExpiresAt?: Date;
}

export interface IUserSession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionToken: string;
  deviceInfo: IDeviceInfo;
  authentication: IAuthentication;
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
  isExpired?: boolean;
  isValid?: boolean;
  duration?: number;
  timeUntilExpiration?: number;
}

// Schema
const deviceInfoSchema = new Schema<IDeviceInfo>(
  {
    userAgent: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    platform: {
      type: String,
      enum: Object.values(UserPlatform),
      required: true,
    },
    browser: {
      type: String,
      enum: Object.values(UserBrowser),
      required: true,
    },
    ip: {
      type: String,
      required: true,
      trim: true,
      match:
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    },
  },
  { _id: false }
);

const authenticationSchema = new Schema<IAuthentication>(
  {
    authMethod: {
      type: String,
      enum: Object.values(UserAuthMethod),
      required: true,
    },
    oauthProvider: {
      type: String,
      enum: Object.values(OAuthProvider),
    },
    oauthAccessToken: {
      type: String,
      sparse: true,
    },
    oauthRefreshToken: {
      type: String,
      sparse: true,
    },
    oauthExpiresAt: { type: Date },
  },
  { _id: false }
);

const userSessionSchema = new Schema<IUserSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionToken: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 255,
    },
    deviceInfo: {
      type: deviceInfoSchema,
      required: true,
    },
    authentication: {
      type: authenticationSchema,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    lastActivity: {
      type: Date,
      required: true,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: false,
    collection: 'user_sessions',
  }
);

// Indexes
userSessionSchema.index({ sessionToken: 1 }, { unique: true });
userSessionSchema.index({ userId: 1, isActive: 1 });
userSessionSchema.index({ expiresAt: 1 });
userSessionSchema.index({ 'deviceInfo.ip': 1 });
userSessionSchema.index({ lastActivity: 1 });
userSessionSchema.index({ 'authentication.authMethod': 1 });
userSessionSchema.index({ createdAt: -1 });
userSessionSchema.index({ userId: 1, createdAt: -1 });

// TTL index for expired sessions
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Middleware
userSessionSchema.pre('save', async function () {
  if (this.isModified('lastActivity') && this.lastActivity) {
    // Optionally extend expiration on activity (7 days from last activity)
    this.expiresAt = new Date(this.lastActivity.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
});

// Virtual for checking if session is expired
userSessionSchema.virtual('isExpired').get(function () {
  return this.expiresAt < new Date();
});

// Virtual for checking if session is valid
userSessionSchema.virtual('isValid').get(function () {
  return this.isActive && !this.isExpired;
});

// Virtual for session duration in milliseconds
userSessionSchema.virtual('duration').get(function () {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for time until expiration in milliseconds
userSessionSchema.virtual('timeUntilExpiration').get(function () {
  return Math.max(0, this.expiresAt.getTime() - Date.now());
});

// Static method to validate user session
userSessionSchema.statics.validateSession = function (sessionToken: string) {
  return this.findOne({
    sessionToken,
    isActive: true,
    expiresAt: { $gt: new Date() },
  })
    .populate('userId', 'username email profile displayName')
    .then((session: IUserSession | null) => {
      if (session) {
        // Update last activity
        return this.findByIdAndUpdate(
          session._id,
          { lastActivity: new Date() },
          { new: true }
        ).populate('userId', 'username email profile.displayName');
      }
      return null;
    });
};

// Static method to get user's active sessions
userSessionSchema.statics.getUserActiveSessions = function (userId: mongoose.Types.ObjectId) {
  return this.find({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  })
    .sort({ lastActivity: -1 })
    .select({
      sessionToken: 1,
      deviceInfo: 1,
      authentication: 1,
      lastActivity: 1,
      createdAt: 1,
      expiresAt: 1,
    });
};

// Static method to create new session
userSessionSchema.statics.createSession = function (
  sessionData: Partial<IUserSession>,
  expirationDays = 7
) {
  const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

  return this.create({
    ...sessionData,
    lastActivity: new Date(),
    createdAt: new Date(),
    expiresAt,
  });
};

// Static method to terminate session
userSessionSchema.statics.terminateSession = function (sessionToken: string) {
  return this.updateOne({ sessionToken }, { isActive: false });
};

// Static method to terminate all user sessions
userSessionSchema.statics.terminateAllUserSessions = function (userId: mongoose.Types.ObjectId) {
  return this.updateMany({ userId }, { isActive: false });
};

// Static method to cleanup expired sessions
userSessionSchema.statics.cleanupExpiredSessions = function () {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false, lastActivity: { $lt: thirtyDaysAgo } },
    ],
  });
};

// Static method to get session analytics
userSessionSchema.statics.getSessionAnalytics = function () {
  return this.aggregate([
    { $match: { isActive: true, expiresAt: { $gt: new Date() } } },
    {
      $group: {
        _id: {
          platform: '$deviceInfo.platform',
          browser: '$deviceInfo.browser',
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
      },
    },
    {
      $group: {
        _id: '$_id.platform',
        browsers: {
          $push: {
            browser: '$_id.browser',
            count: '$count',
          },
        },
        totalSessions: { $sum: '$count' },
        totalUsers: { $sum: { $size: '$uniqueUsers' } },
      },
    },
    { $sort: { totalSessions: -1 } },
  ]);
};

// Static method to detect suspicious activity for user
userSessionSchema.statics.detectSuspiciousActivity = function (
  userId: mongoose.Types.ObjectId,
  timeWindow = 60
) {
  const cutoffDate = new Date(Date.now() - timeWindow * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: cutoffDate },
      },
    },
    {
      $group: {
        _id: '$userId',
        uniqueIPs: { $addToSet: '$deviceInfo.ip' },
        sessionCount: { $sum: 1 },
        locations: { $push: { ip: '$deviceInfo.ip', createdAt: '$createdAt' } },
      },
    },
    { $match: { uniqueIPs: { $size: { $gt: 1 } } } },
  ]);
};

// Static method to get OAuth sessions that need token refresh
userSessionSchema.statics.getOAuthSessionsNeedingRefresh = function () {
  return this.find({
    'authentication.oauthProvider': { $exists: true },
    'authentication.oauthExpiresAt': { $lte: new Date(Date.now() + 5 * 60 * 1000) }, // Expires within 5 minutes
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
};

// Method to update OAuth tokens
userSessionSchema.methods.updateOAuthTokens = function (
  accessToken: string,
  refreshToken: string,
  expiresIn: number
) {
  this.authentication.oauthAccessToken = accessToken;
  this.authentication.oauthRefreshToken = refreshToken;
  this.authentication.oauthExpiresAt = new Date(Date.now() + expiresIn * 1000);
  return this.save();
};

// Method to refresh session activity and extend expiration
userSessionSchema.methods.refreshActivity = function (extensionDays = 7) {
  this.lastActivity = new Date();
  this.expiresAt = new Date(this.lastActivity.getTime() + extensionDays * 24 * 60 * 60 * 1000);
  return this.save();
};

// Method to terminate session
userSessionSchema.methods.terminate = function () {
  this.isActive = false;
  return this.save();
};

export const UserSession = mongoose.model<IUserSession>('UserSession', userSessionSchema);
