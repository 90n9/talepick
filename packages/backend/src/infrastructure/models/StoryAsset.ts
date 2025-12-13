import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStorage {
  provider: string; // 'local' | 'aws_s3' | 'google_cloud' | 'cloudflare'
  bucket: string;
  key: string;
  region: string;
}

export interface IDimensions {
  width?: number;
  height?: number;
}

export interface IUsage {
  context: string; // 'cover_image' | 'background_music' | 'scene_background'
  nodeId?: string;
  sortOrder?: number;
}

export interface IModeration {
  status: string; // 'pending' | 'approved' | 'rejected'
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  notes?: string;
}

export interface IStoryAsset extends Document {
  assetId: string; // unique identifier
  storyId: Types.ObjectId; // references Stories

  name: string;
  description: string;
  originalFilename: string;

  type: string; // 'image' | 'audio' | 'video' | 'document'
  mimeType: string;
  url: string;
  thumbnailUrl?: string;

  storage: IStorage;

  size: number; // file size in bytes
  dimensions?: IDimensions; // for images and videos
  duration?: number; // for audio/video in seconds

  usage: IUsage[];

  status: string; // 'uploading' | 'processing' | 'ready' | 'failed' | 'archived'
  moderation: IModeration;

  tags: string[];

  // Upload metadata
  uploadedBy: Types.ObjectId; // User or admin who uploaded
  uploadSource: string; // 'author_upload' | 'admin_upload' | 'stock_library' | 'ai_generated'
  uploadIp?: string;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  incrementUsage(context: string, nodeId?: string): void;
  getOptimizedUrl(width?: number, height?: number): string;
  getFormattedSize(): string;
}

const StorageSchema = new Schema(
  {
    provider: {
      type: String,
      enum: ['local', 'aws_s3', 'google_cloud', 'cloudflare'],
      required: true,
    },
    bucket: {
      type: String,
      trim: true,
    },
    key: {
      type: String,
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const DimensionsSchema = new Schema(
  {
    width: {
      type: Number,
      min: 1,
    },
    height: {
      type: Number,
      min: 1,
    },
  },
  { _id: false }
);

const UsageSchema = new Schema(
  {
    context: {
      type: String,
      enum: ['cover_image', 'background_music', 'scene_background', 'character_image', 'effect'],
      required: true,
    },
    nodeId: {
      type: String,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const ModerationSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminAccount',
    },
    reviewedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false }
);

const StoryAssetSchema: Schema = new Schema(
  {
    assetId: {
      type: String,
      required: true,
      trim: true,
    },
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    type: {
      type: String,
      enum: ['image', 'audio', 'video', 'document'],
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },

    storage: {
      type: StorageSchema,
      required: true,
    },

    size: {
      type: Number,
      required: true,
      min: 0,
    },
    dimensions: {
      type: DimensionsSchema,
    },
    duration: {
      type: Number,
      min: 0,
    },

    usage: [UsageSchema],

    status: {
      type: String,
      enum: ['uploading', 'processing', 'ready', 'failed', 'archived'],
      default: 'uploading',
    },
    moderation: {
      type: ModerationSchema,
      default: {},
    },

    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],

    // Upload metadata
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadSource: {
      type: String,
      enum: ['author_upload', 'admin_upload', 'stock_library', 'ai_generated'],
      default: 'author_upload',
    },
    uploadIp: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'story_assets',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
StoryAssetSchema.index({ assetId: 1 }, { unique: true });
StoryAssetSchema.index({ storyId: 1, type: 1 });
StoryAssetSchema.index({ type: 1, 'moderation.status': 1 });
StoryAssetSchema.index({ uploadedBy: 1, uploadSource: 1 });
StoryAssetSchema.index({ tags: 1 });
StoryAssetSchema.index({ createdAt: -1 });
StoryAssetSchema.index({ 'moderation.status': 1, status: 1 });
StoryAssetSchema.index({ storyId: 1, type: 1, 'moderation.status': 1 });
StoryAssetSchema.index({ type: 1, uploadSource: 1 });

// Methods
StoryAssetSchema.methods.incrementUsage = function (context: string, nodeId?: string) {
  // Check if this usage context already exists
  const existingUsage = this.usage.find(
    (usage: IUsage) => usage.context === context && usage.nodeId === nodeId
  );

  if (!existingUsage) {
    this.usage.push({ context, nodeId });
  }

  return this.save();
};

StoryAssetSchema.methods.getOptimizedUrl = function (width?: number, height?: number): string {
  // This would generate optimized URLs based on the storage provider
  // For now, return the original URL
  if (this.type === 'image' && (width || height)) {
    // Implementation would depend on the storage provider (S3, Cloudinary, etc.)
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());

    return `${this.url}?${params.toString()}`;
  }

  return this.url;
};

StoryAssetSchema.methods.getFormattedSize = function (): string {
  const bytes = this.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  if (bytes === 0) return '0 Bytes';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

// Static methods
StoryAssetSchema.statics.getStoryAssets = function (storyId: Types.ObjectId, type?: string) {
  const query: Record<string, unknown> = {
    storyId,
    'moderation.status': 'approved',
    status: 'ready',
  };

  if (type) {
    query.type = type;
  }

  return this.find(query).sort({ createdAt: -1 });
};

StoryAssetSchema.statics.getPublicAssets = function (type?: string, limit = 50) {
  const query: Record<string, unknown> = {
    'moderation.status': 'approved',
    status: 'ready',
  };

  if (type) {
    query.type = type;
  }

  return this.find(query).sort({ createdAt: -1 }).limit(limit);
};

StoryAssetSchema.statics.getAssetsByTag = function (tag: string) {
  return this.find({
    tags: tag,
    'moderation.status': 'approved',
    status: 'ready',
  }).sort({ createdAt: -1 });
};

StoryAssetSchema.statics.getStorageStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: '$storage.provider',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' },
        averageSize: { $avg: '$size' },
      },
    },
    {
      $project: {
        provider: '$_id',
        count: 1,
        totalSizeGB: { $round: [{ $divide: ['$totalSize', 1073741824] }, 2] },
        averageSizeMB: { $round: [{ $divide: ['$averageSize', 1048576] }, 2] },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

StoryAssetSchema.statics.getAssetTypeStats = function () {
  return this.aggregate([
    { $match: { 'moderation.status': 'approved', status: 'ready' } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' },
        averageSize: { $avg: '$size' },
      },
    },
    {
      $project: {
        type: '$_id',
        count: 1,
        totalSizeMB: { $round: [{ $divide: ['$totalSize', 1048576] }, 2] },
        averageSizeKB: { $round: [{ $divide: ['$averageSize', 1024] }, 2] },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

StoryAssetSchema.statics.getPendingAssets = function () {
  return this.find({
    'moderation.status': 'pending',
    status: { $ne: 'failed' },
  })
    .sort({ createdAt: -1 })
    .populate('uploadedBy', 'username profile.displayName');
};

StoryAssetSchema.statics.approveAsset = function (
  assetId: string,
  reviewedBy: Types.ObjectId,
  notes?: string
) {
  return this.updateOne(
    { assetId },
    {
      $set: {
        'moderation.status': 'approved',
        'moderation.reviewedBy': reviewedBy,
        'moderation.reviewedAt': new Date(),
        'moderation.notes': notes || 'Approved - meets quality standards',
        status: 'ready',
      },
    }
  );
};

StoryAssetSchema.statics.rejectAsset = function (
  assetId: string,
  reviewedBy: Types.ObjectId,
  notes: string
) {
  return this.updateOne(
    { assetId },
    {
      $set: {
        'moderation.status': 'rejected',
        'moderation.reviewedBy': reviewedBy,
        'moderation.reviewedAt': new Date(),
        'moderation.notes': notes,
        status: 'failed',
      },
    }
  );
};

export const StoryAsset = mongoose.model<IStoryAsset>('StoryAsset', StoryAssetSchema);
export default StoryAsset;
