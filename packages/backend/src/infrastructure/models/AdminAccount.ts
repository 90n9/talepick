import mongoose, { Document, HydratedDocument, Schema } from 'mongoose';

// Admin role enum
export enum AdminRole {
  SUPER_ADMIN = 'Super Admin',
  STORY_EDITOR = 'Story Editor',
  USER_MANAGER = 'User Manager',
  ACHIEVEMENT_MANAGER = 'Achievement Manager',
}

// Admin status enum
export enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

// Authentication method enum
export enum AuthMethod {
  EMAIL = 'email',
  GOOGLE = 'google',
  BOTH = 'both',
}

// Avatar type enum
export enum AvatarType {
  DEFAULT = 'default',
  CUSTOM = 'custom',
  GOOGLE = 'google',
}

// Permission constants
export const PERMISSIONS = {
  // User Management
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_SUSPEND: 'users.suspend',

  // Story Management
  STORIES_READ: 'stories.read',
  STORIES_CREATE: 'stories.create',
  STORIES_UPDATE: 'stories.update',
  STORIES_DELETE: 'stories.delete',
  STORIES_PUBLISH: 'stories.publish',

  // Moderation
  MODERATION_REVIEWS: 'moderation.reviews',
  MODERATION_CONTENT: 'moderation.content',
  MODERATION_FLAGS: 'moderation.flags',

  // System Administration
  SYSTEM_CONFIG: 'system.config',
  SYSTEM_ANALYTICS: 'system.analytics',
  SYSTEM_ADMINS: 'system.admins',

  // Game Mechanics
  ACHIEVEMENTS_MANAGE: 'achievements.manage',
  AVATARS_MANAGE: 'avatars.manage',
  CREDITS_MANAGE: 'credits.manage',
} as const;

// Interfaces
export interface IGoogleProfile {
  displayName: string;
  profileImageUrl: string;
  locale: string;
}

export interface IAuthentication {
  authMethod: AuthMethod;
  googleId?: string;
  googleEmail?: string;
  googleProfile?: IGoogleProfile;
  hasPassword: boolean;
  lastPasswordChange?: Date;
}

export interface IAvatar {
  type: AvatarType;
  value?: string;
}

export interface IProfile {
  displayName: string;
  avatar: IAvatar;
  bio?: string;
}

export interface IAdminAccount extends Document {
  username: string;
  email: string;
  passwordHash?: string;
  authentication: IAuthentication;
  role: AdminRole;
  permissions: string[];
  status: AdminStatus;
  profile: IProfile;
  lastActive?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
}

// Schema
const googleProfileSchema = new Schema<IGoogleProfile>(
  {
    displayName: { type: String, required: true },
    profileImageUrl: { type: String, required: true },
    locale: { type: String, required: true },
  },
  { _id: false }
);

const authenticationSchema = new Schema<IAuthentication>(
  {
    authMethod: {
      type: String,
      enum: Object.values(AuthMethod),
      required: true,
    },
    googleId: { type: String, sparse: true, unique: true },
    googleEmail: { type: String, sparse: true, unique: true },
    googleProfile: { type: googleProfileSchema, sparse: true },
    hasPassword: { type: Boolean, required: true },
    lastPasswordChange: { type: Date },
  },
  { _id: false }
);

const avatarSchema = new Schema<IAvatar>(
  {
    type: {
      type: String,
      enum: Object.values(AvatarType),
      required: true,
    },
    value: { type: String },
  },
  { _id: false }
);

const profileSchema = new Schema<IProfile>(
  {
    displayName: { type: String, required: true, trim: true },
    avatar: { type: avatarSchema, required: true },
    bio: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const adminAccountSchema = new Schema<IAdminAccount>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_-]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: {
      type: String,
      minlength: 60, // bcrypt hash length
      maxlength: 60,
    },
    authentication: {
      type: authenticationSchema,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      required: true,
    },
    permissions: [
      {
        type: String,
        enum: Object.values(PERMISSIONS),
      },
    ],
    status: {
      type: String,
      enum: Object.values(AdminStatus),
      default: AdminStatus.PENDING_VERIFICATION,
    },
    profile: {
      type: profileSchema,
      required: true,
    },
    lastActive: { type: Date },
    lastLogin: { type: Date },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminAccount',
    },
  },
  {
    timestamps: true,
    collection: 'admin_accounts',
  }
);

// Indexes
adminAccountSchema.index({ email: 1 }, { unique: true });
adminAccountSchema.index({ username: 1 }, { unique: true });
adminAccountSchema.index({ 'authentication.googleId': 1 }, { unique: true, sparse: true });
adminAccountSchema.index({ 'authentication.googleEmail': 1 }, { unique: true, sparse: true });
adminAccountSchema.index({ role: 1 });
adminAccountSchema.index({ status: 1 });
adminAccountSchema.index({ lastActive: 1 });
adminAccountSchema.index({ createdAt: -1 });

// Middleware
adminAccountSchema.pre('save', function (this: HydratedDocument<IAdminAccount>) {
  if (this.isModified('lastLogin') && this.lastLogin) {
    this.lastActive = this.lastLogin;
  }
});

// Virtual for checking if admin is active
adminAccountSchema.virtual('isActive').get(function () {
  return this.status === AdminStatus.ACTIVE;
});

// Method to check if admin has specific permission
adminAccountSchema.methods.hasPermission = function (permission: string): boolean {
  return this.permissions.includes(permission);
};

// Method to check if admin has any of the specified permissions
adminAccountSchema.methods.hasAnyPermission = function (permissions: string[]): boolean {
  return permissions.some((permission) => this.permissions.includes(permission));
};

export const AdminAccount = mongoose.model<IAdminAccount>('AdminAccount', adminAccountSchema);
