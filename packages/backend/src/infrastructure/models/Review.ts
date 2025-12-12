import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  userId: Types.ObjectId; // references Users
  storyId: Types.ObjectId; // references Stories
  rating: number; // 1-5
  reviewText: string;
  upVotes: number;
  downVotes: number;
  isSpoiler: boolean;

  // Soft Delete Support
  deletedAt: Date;
  deletedBy: Types.ObjectId;
  deleteReason: string;

  adminReply: {
    text: string;
    adminId: Types.ObjectId; // references Users (admin)
    repliedAt: Date;
  };

  moderation: {
    status: string; // 'approved' | 'pending' | 'rejected' | 'flagged'
    flaggedCount: number;
    moderatedBy: Types.ObjectId;
    moderatedAt: Date;
    reason: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    upVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    downVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    isSpoiler: {
      type: Boolean,
      default: false,
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
      trim: true,
      maxlength: 200,
    },

    adminReply: {
      text: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
      adminId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      repliedAt: {
        type: Date,
      },
    },

    moderation: {
      status: {
        type: String,
        enum: ['approved', 'pending', 'rejected', 'flagged'],
        default: 'approved',
      },
      flaggedCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      moderatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'AdminAccount',
      },
      moderatedAt: {
        type: Date,
      },
      reason: {
        type: String,
        trim: true,
        maxlength: 500,
      },
    },
  },
  {
    timestamps: true,
    collection: 'reviews',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ReviewSchema.index({ userId: 1, storyId: 1 }, { unique: true }); // One review per user per story
ReviewSchema.index({ storyId: 1, rating: 1 });
ReviewSchema.index({ storyId: 1, createdAt: 1 });
ReviewSchema.index({ deletedAt: 1 }, { sparse: true });
ReviewSchema.index({ 'moderation.status': 1 });

// Methods
ReviewSchema.methods.addUpVote = function () {
  this.upVotes += 1;
  return this.save();
};

ReviewSchema.methods.addDownVote = function () {
  this.downVotes += 1;
  return this.save();
};

ReviewSchema.methods.updateContent = function (newContent: string) {
  this.reviewText = newContent;
  return this.save();
};

// Pre-save middleware
ReviewSchema.pre('save', function (next) {
  // Validate rating range
  if (this.rating < 1 || this.rating > 5) {
    return next(new Error('Rating must be between 1 and 5'));
  }

  next();
});

// Static methods
ReviewSchema.statics.getAverageRating = async function (storyId: Types.ObjectId) {
  const result = await this.aggregate([
    {
      $match: { storyId: storyId, 'moderation.status': 'approved', deletedAt: { $exists: false } },
    },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  return result.length > 0
    ? { average: result[0].avgRating, count: result[0].count }
    : { average: 0, count: 0 };
};

export default mongoose.model<IReview>('Review', ReviewSchema);
