import mongoose, { Document, HydratedDocument, Schema } from 'mongoose';
import crypto from 'crypto';

// OTP type enum
export enum OtpType {
  REGISTRATION = 'registration',
  PASSWORD_RESET = 'password_reset',
  LOGIN_VERIFICATION = 'login_verification',
}

// OTP status enum
export enum OtpStatus {
  PENDING = 'pending',
  USED = 'used',
  EXPIRED = 'expired',
  MAX_ATTEMPTS = 'max_attempts',
}

// Interfaces
export interface IOtpMetadata {
  username?: string;
  passwordHash?: string;
  displayName?: string;
  source?: string;
}

export interface IOtpCode extends Document {
  email: string;
  code: string;
  type: OtpType;
  userId?: mongoose.Types.ObjectId;
  attempts: number;
  maxAttempts: number;
  usedAt?: Date;
  createdAt: Date;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  metadata: IOtpMetadata;
  isExpired?: boolean;
  isUsed?: boolean;
  isValid?: boolean;
  remainingTime?: number;
  remainingAttempts?: number;
  status?: OtpStatus;
}

interface OtpCodeModel extends mongoose.Model<IOtpCode> {
  generateSecureCode(): string;
  createOtp(
    email: string,
    type: OtpType,
    ipAddress: string,
    userAgent: string,
    metadata?: IOtpMetadata,
    expirationMinutes?: number
  ): Promise<IOtpCode>;
  findAndValidate(email: string, code: string, type: OtpType): Promise<IOtpCode | null>;
  checkRateLimit(email: string, type: OtpType, maxRequests?: number): Promise<number>;
  incrementAttempts(otpId: mongoose.Types.ObjectId): Promise<boolean>;
  markAsUsed(otpId: mongoose.Types.ObjectId): Promise<boolean>;
  invalidatePreviousOtps(email: string, type: OtpType): Promise<boolean>;
  getRecentOtps(hoursBack?: number, type?: OtpType): Promise<IOtpCode[]>;
  cleanupExpired(): Promise<{ deletedCount: number }>;
  getStatistics(daysBack?: number): Promise<unknown>;
}

// Schema
const metadataSchema = new Schema<IOtpMetadata>(
  {
    username: { type: String, trim: true, maxlength: 50 },
    passwordHash: { type: String },
    displayName: { type: String, trim: true, maxlength: 100 },
    source: { type: String, trim: true, maxlength: 20 },
  },
  { _id: false }
);

const otpCodeSchema = new Schema<IOtpCode, OtpCodeModel>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    code: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 6,
      match: /^[0-9]{6}$/,
    },
    type: {
      type: String,
      enum: Object.values(OtpType),
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
    attempts: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      required: true,
      min: 1,
      default: 3,
    },
    usedAt: {
      type: Date,
      sparse: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: function () {
        // Default 10 minutes expiration
        return new Date(Date.now() + 10 * 60 * 1000);
      },
    },
    ipAddress: {
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
    metadata: {
      type: metadataSchema,
      default: {},
    },
  },
  {
    timestamps: false, // We use our own timestamp fields
    collection: 'otp_codes',
    statics: {
      generateSecureCode(this: OtpCodeModel): string {
        const buffer = crypto.randomBytes(3); // 3 bytes = 24 bits = 8,388,608 possible values
        const code = buffer.readUIntBE(0, 3) % 1000000; // Ensure it's 6 digits
        return code.toString().padStart(6, '0');
      },
      createOtp(
        this: OtpCodeModel,
        email: string,
        type: OtpType,
        ipAddress: string,
        userAgent: string,
        metadata: IOtpMetadata = {},
        expirationMinutes: number = 10
      ): Promise<IOtpCode> {
        const code = this.generateSecureCode();
        const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

        return this.create({
          email,
          code,
          type,
          attempts: 0,
          maxAttempts: 3,
          expiresAt,
          ipAddress,
          userAgent,
          metadata,
        });
      },
      findAndValidate(
        this: OtpCodeModel,
        email: string,
        code: string,
        type: OtpType
      ): Promise<IOtpCode | null> {
        return this.findOne({
          email: email.toLowerCase(),
          code,
          type,
          usedAt: null,
          expiresAt: { $gt: new Date() },
          attempts: { $lt: 3 },
        });
      },
      async checkRateLimit(
        this: OtpCodeModel,
        email: string,
        type: OtpType,
        maxRequests: number = 5
      ): Promise<number> {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const count = await this.countDocuments({
          email: email.toLowerCase(),
          type,
          createdAt: { $gte: oneHourAgo },
        });

        if (count >= maxRequests) {
          throw new Error(`Rate limit exceeded. Maximum ${maxRequests} OTP requests per hour.`);
        }
        return count;
      },
      async incrementAttempts(
        this: OtpCodeModel,
        otpId: mongoose.Types.ObjectId
      ): Promise<boolean> {
        const result = await this.updateOne(
          { _id: otpId, attempts: { $lt: 3 } },
          { $inc: { attempts: 1 } }
        );
        if (result.matchedCount === 0) {
          throw new Error('Maximum attempts exceeded or OTP not found');
        }
        return true;
      },
      async markAsUsed(this: OtpCodeModel, otpId: mongoose.Types.ObjectId): Promise<boolean> {
        const result = await this.updateOne(
          { _id: otpId, usedAt: null },
          { $set: { usedAt: new Date() } }
        );
        return result.modifiedCount > 0;
      },
      async invalidatePreviousOtps(
        this: OtpCodeModel,
        email: string,
        type: OtpType
      ): Promise<boolean> {
        const result = await this.updateMany(
          {
            email: email.toLowerCase(),
            type,
            usedAt: null,
            expiresAt: { $gt: new Date() },
          },
          { $set: { usedAt: new Date() } }
        );
        return result.modifiedCount > 0;
      },
      getRecentOtps(this: OtpCodeModel, hoursBack: number = 1, type?: OtpType) {
        const cutoffDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
        const query: Record<string, unknown> = {
          createdAt: { $gte: cutoffDate },
        };

        if (type) {
          query.type = type;
        }

        return this.find(query)
          .sort({ createdAt: -1 })
          .select({
            email: 1,
            type: 1,
            attempts: 1,
            ipAddress: 1,
            createdAt: 1,
            usedAt: 1,
            expiresAt: 1,
          })
          .exec();
      },
      cleanupExpired(this: OtpCodeModel): Promise<{ deletedCount: number }> {
        return this.deleteMany({
          expiresAt: { $lt: new Date() },
        });
      },
      getStatistics(this: OtpCodeModel, daysBack: number = 7) {
        const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

        return this.aggregate([
          { $match: { createdAt: { $gte: cutoffDate } } },
          {
            $group: {
              _id: '$type',
              totalGenerated: { $sum: 1 },
              totalUsed: { $sum: { $cond: [{ $ne: ['$usedAt', null] }, 1, 0] } },
              totalExpired: { $sum: { $cond: [{ $lt: ['$expiresAt', new Date()] }, 1, 0] } },
              averageAttempts: { $avg: '$attempts' },
              uniqueEmails: { $addToSet: '$email' },
            },
          },
          {
            $project: {
              type: '$_id',
              totalGenerated: 1,
              totalUsed: 1,
              totalExpired: 1,
              usageRate: { $multiply: [{ $divide: ['$totalUsed', '$totalGenerated'] }, 100] },
              expirationRate: {
                $multiply: [{ $divide: ['$totalExpired', '$totalGenerated'] }, 100],
              },
              averageAttempts: { $round: ['$averageAttempts', 2] },
              uniqueEmailCount: { $size: '$uniqueEmails' },
            },
          },
          { $sort: { totalGenerated: -1 } },
        ]);
      },
    },
  }
);

// Indexes
otpCodeSchema.index({ email: 1, type: 1, usedAt: 1 }, { sparse: true });
otpCodeSchema.index({ code: 1, expiresAt: 1 }, { expireAfterSeconds: 0 });
otpCodeSchema.index({ userId: 1 }, { sparse: true });
otpCodeSchema.index({ email: 1, createdAt: 1 });

// Compound indexes for complex queries
otpCodeSchema.index({ email: 1, type: 1, createdAt: -1 });
otpCodeSchema.index({ type: 1, createdAt: -1 });

// Virtual for checking if OTP is expired
otpCodeSchema.virtual('isExpired').get(function () {
  return this.expiresAt < new Date();
});

// Virtual for checking if OTP is used
otpCodeSchema.virtual('isUsed').get(function () {
  return this.usedAt !== null && this.usedAt !== undefined;
});

// Virtual for checking if OTP is valid (not expired, not used, within attempt limit)
otpCodeSchema.virtual('isValid').get(function () {
  return !this.isExpired && !this.isUsed && this.attempts < this.maxAttempts;
});

// Virtual for remaining time in seconds
otpCodeSchema.virtual('remainingTime').get(function () {
  const now = new Date();
  if (this.expiresAt <= now) return 0;
  return Math.floor((this.expiresAt.getTime() - now.getTime()) / 1000);
});

// Virtual for remaining attempts
otpCodeSchema.virtual('remainingAttempts').get(function () {
  return Math.max(0, this.maxAttempts - this.attempts);
});

// Virtual for OTP status
otpCodeSchema.virtual('status').get(function (): OtpStatus {
  if (this.isUsed) return OtpStatus.USED;
  if (this.isExpired) return OtpStatus.EXPIRED;
  if (this.attempts >= this.maxAttempts) return OtpStatus.MAX_ATTEMPTS;
  return OtpStatus.PENDING;
});

// Middleware to hash code if needed (storing as is for now since it's a temporary value)
otpCodeSchema.pre('save', function (this: HydratedDocument<IOtpCode>) {
  // You could add additional validation here if needed
});

export const OtpCode = mongoose.model<IOtpCode, OtpCodeModel>('OtpCode', otpCodeSchema);
