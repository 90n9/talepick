import mongoose, { Document, Schema } from 'mongoose';

// Login method enum
export enum LoginMethod {
  EMAIL = 'email',
  GOOGLE = 'google',
}

// Failure reason enum
export enum FailureReason {
  INVALID_CREDENTIALS = 'invalid_credentials',
  ACCOUNT_DISABLED = 'account_disabled',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_SESSION = 'invalid_session',
  GEOLOCATION_BLOCKED = 'geolocation_blocked',
  OAUTH_ERROR = 'oauth_error',
}

// Interfaces
export interface ILocation {
  country: string;
  city: string;
  timezone: string;
}

export interface IAdminLoginHistory extends Document {
  adminId: mongoose.Types.ObjectId;
  loginTime: Date;
  method: LoginMethod;
  success: boolean;
  ip: string;
  userAgent: string;
  location: ILocation;
  sessionId?: string;
  sessionExpiresAt?: Date;
  failureReason?: FailureReason;
  createdAt: Date;
}

// Schema
const locationSchema = new Schema<ILocation>(
  {
    country: { type: String, required: true },
    city: { type: String, required: true },
    timezone: { type: String, required: true },
  },
  { _id: false }
);

const adminLoginHistorySchema = new Schema<IAdminLoginHistory>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'AdminAccount',
      required: true,
    },
    loginTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    method: {
      type: String,
      enum: Object.values(LoginMethod),
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
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
    location: {
      type: locationSchema,
      required: true,
    },
    sessionId: {
      type: String,
      sparse: true,
    },
    sessionExpiresAt: {
      type: Date,
      sparse: true,
    },
    failureReason: {
      type: String,
      enum: Object.values(FailureReason),
      sparse: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'admin_login_history',
  }
);

// Indexes
adminLoginHistorySchema.index({ adminId: 1, loginTime: -1 });
adminLoginHistorySchema.index({ ip: 1 });
adminLoginHistorySchema.index({ success: 1, loginTime: -1 });
adminLoginHistorySchema.index({ sessionId: 1 });
adminLoginHistorySchema.index({ loginTime: -1 });
adminLoginHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 }); // 2 years TTL

// Compound indexes for security monitoring
adminLoginHistorySchema.index({ success: 1, failureReason: 1, loginTime: -1 });
adminLoginHistorySchema.index({ adminId: 1, success: 1, loginTime: -1 });
adminLoginHistorySchema.index({ 'location.country': 1, loginTime: -1 });

// Virtual for checking if session is still active
adminLoginHistorySchema.virtual('isSessionActive').get(function () {
  return (
    this.success && this.sessionId && this.sessionExpiresAt && this.sessionExpiresAt > new Date()
  );
});

// Virtual for session age
adminLoginHistorySchema.virtual('sessionAge').get(function () {
  if (!this.loginTime) return null;
  return Date.now() - this.loginTime.getTime();
});

// Static method to find recent login attempts
adminLoginHistorySchema.statics.findRecentByAdmin = function (
  adminId: mongoose.Types.ObjectId,
  limit: number = 20
) {
  return this.find({ adminId }).sort({ loginTime: -1 }).limit(limit).select({
    loginTime: 1,
    method: 1,
    success: 1,
    ip: 1,
    location: 1,
    failureReason: 1,
  });
};

// Static method to find failed login attempts
adminLoginHistorySchema.statics.findFailedLogins = function (hoursBack: number = 24) {
  const cutoffDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  return this.find({
    success: false,
    loginTime: { $gte: cutoffDate },
  })
    .sort({ loginTime: -1 })
    .populate('adminId', 'username email');
};

// Static method to detect suspicious IP activity
adminLoginHistorySchema.statics.findSuspiciousIPs = function (
  hoursBack: number = 24,
  failedThreshold: number = 10,
  totalThreshold: number = 50
) {
  const cutoffDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  return this.aggregate([
    { $match: { loginTime: { $gte: cutoffDate } } },
    {
      $group: {
        _id: '$ip',
        totalAttempts: { $sum: 1 },
        failedAttempts: {
          $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] },
        },
        uniqueAdmins: { $addToSet: '$adminId' },
        countries: { $addToSet: '$location.country' },
      },
    },
    {
      $match: {
        $or: [
          { failedAttempts: { $gt: failedThreshold } },
          { totalAttempts: { $gt: totalThreshold } },
          { $expr: { $gt: [{ $size: '$uniqueAdmins' }, 5] } },
        ],
      },
    },
    { $sort: { failedAttempts: -1 } },
  ]);
};

// Static method to get active sessions
adminLoginHistorySchema.statics.getActiveSessions = function () {
  return this.find({
    success: true,
    sessionExpiresAt: { $gt: new Date() },
  })
    .sort({ loginTime: -1 })
    .populate('adminId', 'username email role');
};

// Static method to get geographic login patterns
adminLoginHistorySchema.statics.getGeographicPatterns = function (daysBack: number = 7) {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        success: true,
        loginTime: { $gte: cutoffDate },
      },
    },
    {
      $group: {
        _id: {
          adminId: '$adminId',
          country: '$location.country',
        },
        loginCount: { $sum: 1 },
        cities: { $addToSet: '$location.city' },
      },
    },
    {
      $group: {
        _id: '$_id.adminId',
        countries: { $addToSet: '$_id.country' },
        totalLogins: { $sum: '$loginCount' },
      },
    },
    { $match: { countries: { $size: { $gt: 1 } } } },
    { $sort: { totalLogins: -1 } },
    {
      $lookup: {
        from: 'admin_accounts',
        localField: '_id',
        foreignField: '_id',
        as: 'admin',
      },
    },
    { $unwind: '$admin' },
    {
      $project: {
        username: '$admin.username',
        email: '$admin.email',
        countries: 1,
        totalLogins: 1,
      },
    },
  ]);
};

export const AdminLoginHistory = mongoose.model<IAdminLoginHistory>(
  'AdminLoginHistory',
  adminLoginHistorySchema
);
