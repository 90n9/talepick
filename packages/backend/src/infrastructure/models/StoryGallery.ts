import mongoose, { Schema, Document, Types, HydratedDocument } from 'mongoose';

export interface IUrls {
  original?: string; // Full resolution image URL
  large?: string; // 1200x800 or similar
  medium?: string; // 800x533 or similar
  thumbnail?: string; // 300x200 or similar
  small?: string; // 150x100 or similar
}

export interface IMetadata {
  width?: number;
  height?: number;
  fileSize?: number; // in bytes
  mimeType?: string; // 'image/jpeg', 'image/png', etc.
  aspectRatio?: string; // '16:9', '4:3', etc.
}

export interface IDisplay {
  sortOrder?: number; // Order in gallery (1, 2, 3...)
  isFeatured?: boolean; // Primary gallery image
  isHidden?: boolean; // Hide from public gallery
  showInPreview?: boolean; // Show in story preview carousel
}

export interface IModeration {
  status?: string; // 'pending' | 'approved' | 'rejected'
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  notes?: string;
}

export interface IAnalytics {
  viewCount?: number; // How many times this image was viewed
  clickCount?: number; // How many times this image was clicked
  lastViewedAt?: Date;
}

export interface IStoryGallery extends Document {
  galleryImageId: string; // unique identifier
  storyId: Types.ObjectId; // references Stories

  // Image Information
  name: string;
  description: string;
  caption: string; // Thai caption for the image

  // Asset Reference (links to StoryAsset)
  assetId: string; // references StoryAsset.assetId

  // Cached URLs (denormalized for performance)
  urls: IUrls;

  // Image Metadata
  metadata: IMetadata;

  // Display Settings
  display: IDisplay;

  // Moderation
  moderation: IModeration;

  // Analytics
  analytics: IAnalytics;

  createdAt: Date;
  updatedAt: Date;

  // Methods
  recordView(): void;
  recordClick(): void;
  setAsFeatured(): void;
}

const StoryGallerySchema: Schema = new Schema(
  {
    galleryImageId: {
      type: String,
      required: true,
      trim: true,
    },
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },

    // Image Information
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
    caption: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Asset Reference
    assetId: {
      type: String,
      required: true,
      trim: true,
    },

    // Cached URLs
    urls: {
      original: {
        type: String,
        required: true,
      },
      large: {
        type: String,
        required: true,
      },
      medium: {
        type: String,
        required: true,
      },
      thumbnail: {
        type: String,
        required: true,
      },
      small: {
        type: String,
        required: true,
      },
    },

    // Image Metadata
    metadata: {
      width: {
        type: Number,
        min: 1,
      },
      height: {
        type: Number,
        min: 1,
      },
      fileSize: {
        type: Number,
        min: 0,
      },
      mimeType: {
        type: String,
        enum: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      },
      aspectRatio: {
        type: String,
        trim: true,
      },
    },

    // Display Settings
    display: {
      sortOrder: {
        type: Number,
        default: 0,
      },
      isFeatured: {
        type: Boolean,
        default: false,
      },
      isHidden: {
        type: Boolean,
        default: false,
      },
      showInPreview: {
        type: Boolean,
        default: true,
      },
    },

    // Moderation
    moderation: {
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

    // Analytics
    analytics: {
      viewCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      clickCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastViewedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
    collection: 'story_gallery',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
StoryGallerySchema.index({ galleryImageId: 1 }, { unique: true });
StoryGallerySchema.index({ storyId: 1, 'display.sortOrder': 1 });
StoryGallerySchema.index({ storyId: 1, 'display.isFeatured': 1 });
StoryGallerySchema.index({ storyId: 1, 'moderation.status': 1 });
StoryGallerySchema.index({ 'display.showInPreview': 1, storyId: 1 });

// Methods
StoryGallerySchema.methods.recordView = function () {
  this.analytics.viewCount = (this.analytics.viewCount || 0) + 1;
  this.analytics.lastViewedAt = new Date();
  return this.save();
};

StoryGallerySchema.methods.recordClick = function () {
  this.analytics.clickCount = (this.analytics.clickCount || 0) + 1;
  return this.save();
};

StoryGallerySchema.methods.setAsFeatured = function (this: HydratedDocument<IStoryGallery>) {
  const Model = this.constructor as mongoose.Model<IStoryGallery>;
  // First, unset featured flag on all other images in this story
  return Model.updateMany(
    { storyId: this.storyId, galleryImageId: { $ne: this.galleryImageId } },
    { $set: { 'display.isFeatured': false } }
  ).then(() => {
    // Then set this image as featured
    this.display.isFeatured = true;
    return this.save();
  });
};

// Static methods
StoryGallerySchema.statics.getStoryGallery = function (storyId: Types.ObjectId) {
  return this.find({
    storyId,
    'moderation.status': 'approved',
    'display.isHidden': false,
  }).sort({ 'display.sortOrder': 1 });
};

StoryGallerySchema.statics.getFeaturedImage = function (storyId: Types.ObjectId) {
  return this.findOne({
    storyId,
    'display.isFeatured': true,
    'moderation.status': 'approved',
    'display.isHidden': false,
  });
};

StoryGallerySchema.statics.getPreviewImages = function (storyId: Types.ObjectId, limit = 5) {
  return this.find({
    storyId,
    'display.showInPreview': true,
    'moderation.status': 'approved',
    'display.isHidden': false,
  })
    .sort({ 'display.sortOrder': 1 })
    .limit(limit);
};

StoryGallerySchema.statics.updateGalleryOrder = function (
  storyId: Types.ObjectId,
  imageOrders: Array<{ galleryImageId: string; sortOrder: number }>
) {
  const bulkOps = imageOrders.map(({ galleryImageId, sortOrder }) => ({
    updateOne: {
      filter: { storyId, galleryImageId },
      update: { $set: { 'display.sortOrder': sortOrder } },
    },
  }));

  return this.bulkWrite(bulkOps);
};

StoryGallerySchema.statics.getPendingImages = function (limit = 50) {
  return this.find({
    'moderation.status': 'pending',
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

StoryGallerySchema.statics.approveImage = function (
  galleryImageId: string,
  reviewedBy: Types.ObjectId,
  notes?: string
) {
  return this.updateOne(
    { galleryImageId },
    {
      $set: {
        'moderation.status': 'approved',
        'moderation.reviewedBy': reviewedBy,
        'moderation.reviewedAt': new Date(),
        'moderation.notes': notes || 'Approved - meets quality standards',
      },
    }
  );
};

StoryGallerySchema.statics.getMostPopularImages = function (limit = 20) {
  return this.find({
    'moderation.status': 'approved',
    'display.isHidden': false,
  })
    .sort({ 'analytics.viewCount': -1 })
    .limit(limit)
    .populate('storyId', 'title');
};

export const StoryGallery = mongoose.model<IStoryGallery>('StoryGallery', StoryGallerySchema);
export default StoryGallery;
