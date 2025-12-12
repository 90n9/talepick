import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICreditTransaction extends Document {
  userId: Types.ObjectId; // references Users
  transactionType: string; // 'earn' | 'spend' | 'refund' | 'bonus'
  source: string; // 'choice' | 'review' | 'achievement' | 'refill' | 'purchase'
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  relatedId: string;
  description: string;
  metadata: {
    storyTitle: string;
    choiceText: string;
    achievementName: string;
  };

  // Soft Delete Support
  deletedAt: Date;
  deletedBy: Types.ObjectId;
  deleteReason: string;

  createdAt: Date;
  expiresAt: Date; // for temporary credits
  updatedAt: Date;
}

const CreditTransactionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['earn', 'spend', 'refund', 'bonus'],
      required: true,
    },
    source: {
      type: String,
      enum: ['choice', 'review', 'achievement', 'refill', 'purchase'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    relatedId: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    metadata: {
      storyTitle: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      choiceText: {
        type: String,
        trim: true,
        maxlength: 500,
      },
      achievementName: {
        type: String,
        trim: true,
        maxlength: 100,
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
      trim: true,
      maxlength: 200,
    },

    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'creditTransactions',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
CreditTransactionSchema.index({ userId: 1, createdAt: -1 });
CreditTransactionSchema.index({ transactionType: 1 });
CreditTransactionSchema.index({ source: 1 });
CreditTransactionSchema.index({ deletedAt: 1 }, { sparse: true });

export default mongoose.model<ICreditTransaction>('CreditTransaction', CreditTransactionSchema);
