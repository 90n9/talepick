import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  username: string;
  passwordHash?: string;

  // Profile Information
  profile: {
    displayName: string;
    avatar: {
      type: string; // 'default' | 'custom' | 'google'
      value: string; // URL or avatar ID
    };
    bio: string;
    profileImageUrl: string; // from Google profile
  };

  // Authentication Methods
  authentication: {
    authMethod: string; // 'email' | 'google' | 'guest'
    isGuest: boolean;
    googleId: string; // for OAuth, unique indexed
    emailVerified: boolean;
    hasPassword: boolean;
  };

  // Account Management
  accountStatus: {
    status: string; // 'active' | 'suspended' | 'banned' | 'under_review' | 'locked'
    reason: string;
    moderatedBy: Types.ObjectId;
    moderatedAt: Date;
    suspensionEndsAt: Date;
    lockType: string; // 'manual' | 'auto_security' | 'auto_fraud'
    lockExpiresAt: Date;
  };

  // Game Statistics
  gameStats: {
    credits: number;
    maxCredits: number;
    lastCreditRefill: Date;
    totalStoriesPlayed: number;
    totalEndingsUnlocked: number;
    totalAvatarsUnlocked: number; // denormalized count from user_avatars
    currentAvatarId: string;
    createdAt: Date;
    lastLoginAt: Date;
  };

  // Soft Delete Support
  deletedAt: Date;
  deletedBy: Types.ObjectId;
  deleteReason: string;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicJSON(): Record<string, unknown>;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      index: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },

    // Profile Information
    profile: {
      displayName: {
        type: String,
        required: true,
        trim: true,
      },
      avatar: {
        type: {
          type: String,
          enum: ['default', 'custom', 'google'],
          default: 'default',
        },
        value: {
          type: String,
          default: '',
        },
      },
      bio: {
        type: String,
        trim: true,
        maxlength: 500,
      },
      profileImageUrl: {
        type: String,
      },
    },

    // Authentication Methods
    authentication: {
      authMethod: {
        type: String,
        enum: ['email', 'google', 'guest'],
        required: true,
      },
      isGuest: {
        type: Boolean,
        default: false,
      },
      googleId: {
        type: String,
        sparse: true,
        index: true,
      },
      emailVerified: {
        type: Boolean,
        default: false,
      },
      hasPassword: {
        type: Boolean,
        default: false,
      },
    },

    // Account Management
    accountStatus: {
      status: {
        type: String,
        enum: ['active', 'suspended', 'banned', 'under_review', 'locked'],
        default: 'active',
      },
      reason: {
        type: String,
      },
      moderatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'AdminAccount',
      },
      moderatedAt: {
        type: Date,
      },
      suspensionEndsAt: {
        type: Date,
      },
      lockType: {
        type: String,
        enum: ['manual', 'auto_security', 'auto_fraud'],
      },
      lockExpiresAt: {
        type: Date,
      },
    },

    // Game Statistics
    gameStats: {
      credits: {
        type: Number,
        default: 10,
        min: 0,
      },
      maxCredits: {
        type: Number,
        default: 10,
        min: 1,
      },
      lastCreditRefill: {
        type: Date,
        default: Date.now,
      },
      totalStoriesPlayed: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalEndingsUnlocked: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalAvatarsUnlocked: {
        type: Number,
        default: 0,
        min: 0,
      },
      currentAvatarId: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      lastLoginAt: {
        type: Date,
      },
    },

    // Soft Delete Support
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminAccount',
    },
    deleteReason: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ 'authentication.googleId': 1 }, { unique: true, sparse: true });
UserSchema.index({ 'accountStatus.status': 1 });
UserSchema.index({ deletedAt: 1 }, { sparse: true });

// Pre-save middleware for password hashing
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) {
    return next();
  }

  try {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    this.authentication.hasPassword = true;
  } catch (error) {
    return next(error);
  }
  next();
});

// Methods
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

UserSchema.methods.toPublicJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.authentication.googleId;
  return user;
};

export default mongoose.model<IUser>('User', UserSchema);
