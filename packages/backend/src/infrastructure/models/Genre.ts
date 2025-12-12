import mongoose, { Schema, Document } from 'mongoose';

export interface IGenre extends Document {
  slug: string; // unique identifier, URL-friendly
  name: string;
  description: string;
  storyCount: number; // Denormalized for performance
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const GenreSchema: Schema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9-]+$/, // URL-friendly slug
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    storyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    icon: {
      type: String,
    },
    color: {
      type: String,
      match: /^#[0-9A-Fa-f]{6}$/, // Hex color code
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'genres',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
GenreSchema.index({ slug: 1 }, { unique: true });
GenreSchema.index({ isActive: 1 });
GenreSchema.index({ sortOrder: 1 });
GenreSchema.index({ storyCount: -1 });

export default mongoose.model<IGenre>('Genre', GenreSchema);
