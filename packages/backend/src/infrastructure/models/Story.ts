import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStory extends Document {
  title: string;
  description: string;

  // Story Metadata
  metadata: {
    genre: string; // references Genres.slug
    tags: string[];
    author: string;
    createdAt: Date;
    publishedAt: Date;
    isPublished: boolean;
    isComingSoon: boolean;
    launchDate: Date;

    // Content Rating System
    contentRating: {
      ageRating: number; // 0, 13, 16, 18+
      violenceLevel: string; // 'none' | 'mild' | 'moderate' | 'high'
      contentWarnings: string[];
    };
  };

  // Media Assets
  media: {
    coverImageAssetId: string;
    headerImageAssetId: string;
    coverVideoAssetId: string;
    bgMusicAssetId: string;
    coverImageUrl: string;
    headerImageUrl: string;
    coverVideoUrl: string;
    bgMusicUrl: string;
    trailerUrl: string; // YouTube/Vimeo URL for story trailer
  };

  // Story Gallery (references StoryGallery collection)
  gallery: {
    imageIds: string[]; // Array of StoryGallery image IDs
    totalImages: number; // Denormalized count for quick access
    featuredImageId: string; // Primary gallery image ID
  };

  // Performance Statistics
  stats: {
    totalPlayers: number;
    averageRating: number;
    totalRatings: number;
    averagePlaytime: number;
    estimatedDuration: string;
    totalEndings: number;
    totalChoices: number;
  };

  // Story Structure
  content: {
    startingNodeId: string; // starting node ID - nodes queried from StoryNodes collection
  };

  // Moderation
  moderation: {
    status: string; // 'approved' | 'pending' | 'suspended' | 'removed'
    reportCount: number;
    moderatedBy: Types.ObjectId;
    moderatedAt: Date;
  };

  // Soft Delete
  deletedAt: Date;
  deletedBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;

  // Methods
  updateStats(players: number, rating: number, completionTime: number): void;
}

const StorySchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // Story Metadata
    metadata: {
      genre: {
        type: String,
        required: true,
        trim: true,
      },
      tags: [
        {
          type: String,
          trim: true,
          maxlength: 50,
        },
      ],
      author: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      publishedAt: {
        type: Date,
      },
      isPublished: {
        type: Boolean,
        default: false,
      },
      isComingSoon: {
        type: Boolean,
        default: false,
      },
      launchDate: {
        type: Date,
      },

      // Content Rating System
      contentRating: {
        ageRating: {
          type: Number,
          required: true,
          enum: [0, 13, 16, 18],
          default: 13,
        },
        violenceLevel: {
          type: String,
          enum: ['none', 'mild', 'moderate', 'high'],
          default: 'none',
        },
        contentWarnings: [
          {
            type: String,
            trim: true,
            maxlength: 50,
          },
        ],
      },
    },

    // Media Assets
    media: {
      coverImageAssetId: {
        type: String,
      },
      headerImageAssetId: {
        type: String,
      },
      coverVideoAssetId: {
        type: String,
      },
      bgMusicAssetId: {
        type: String,
      },
      coverImageUrl: {
        type: String,
      },
      headerImageUrl: {
        type: String,
      },
      coverVideoUrl: {
        type: String,
      },
      bgMusicUrl: {
        type: String,
      },
      trailerUrl: {
        type: String,
      },
    },

    // Story Gallery (references StoryGallery collection)
    gallery: {
      imageIds: [
        {
          type: String,
        },
      ],
      totalImages: {
        type: Number,
        default: 0,
        min: 0,
      },
      featuredImageId: {
        type: String,
      },
    },

    // Performance Statistics
    stats: {
      totalPlayers: {
        type: Number,
        default: 0,
        min: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalRatings: {
        type: Number,
        default: 0,
        min: 0,
      },
      averagePlaytime: {
        type: Number,
        default: 0,
        min: 0,
      },
      estimatedDuration: {
        type: String,
        trim: true,
        maxlength: 20,
      },
      totalEndings: {
        type: Number,
        default: 1,
        min: 1,
      },
      totalChoices: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // Story Structure
    content: {
      startingNodeId: {
        type: String,
        trim: true,
      },
    },

    // Moderation
    moderation: {
      status: {
        type: String,
        enum: ['approved', 'pending', 'suspended', 'removed'],
        default: 'approved',
      },
      reportCount: {
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
    },

    // Soft Delete
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminAccount',
    },
  },
  {
    timestamps: true,
    collection: 'stories',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
StorySchema.index({ title: 'text' });
StorySchema.index({ 'metadata.genre': 1 });
StorySchema.index({ 'metadata.author': 1 });
StorySchema.index({ 'metadata.isPublished': 1, 'metadata.publishedAt': 1 });
StorySchema.index({ 'content.startingNodeId': 1 });
StorySchema.index({ 'stats.totalPlayers': -1 });
StorySchema.index({ 'stats.averageRating': -1 });
StorySchema.index({ 'gallery.totalImages': 1 });
StorySchema.index({ 'gallery.featuredImageId': 1 });
StorySchema.index({ 'media.trailerUrl': 1 });
StorySchema.index({ deletedAt: 1 }, { sparse: true });
StorySchema.index({ 'moderation.status': 1 });

export default mongoose.model<IStory>('Story', StorySchema);
