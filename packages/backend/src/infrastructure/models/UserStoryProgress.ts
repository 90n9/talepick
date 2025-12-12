import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChoice {
  nodeId: string;
  choiceId: string;
  choiceText: string;
  madeAt: Date;
}

export interface IEndingData {
  endingId?: string;
  endingTitle?: string;
  endingType?: string; // 'good' | 'bad' | 'neutral' | 'secret'
  isRare?: boolean;
}

export interface IUserStoryProgress extends Document {
  userId: Types.ObjectId; // references Users
  storyId: Types.ObjectId; // references Stories

  // Playthrough identification
  playthroughId: string; // unique identifier for each playthrough

  // Progress tracking
  currentNodeId: string; // current node in story
  visitedNodes: string[]; // array of visited node IDs
  choices: IChoice[]; // user's choice history

  // Playthrough status
  hasCompleted: boolean;
  completedAt?: Date;
  endingData?: IEndingData;

  // Performance metrics
  timeSpent: number; // total time in milliseconds
  creditsSpent: number;
  nodesVisited: number; // denormalized count
  choicesMade: number; // denormalized count

  // Session tracking
  lastPlayedAt: Date;
  sessionCount: number; // how many sessions played
  currentSessionStart: Date;

  // Playthrough metadata
  playthroughType: string; // 'normal' | 'speedrun' | 'completionist'
  difficulty?: string; // if story has difficulty levels
  customSettings?: Record<string, unknown>; // story-specific settings

  createdAt: Date;
  updatedAt: Date;

  // Methods
  makeChoice(nodeId: string, choiceId: string, choiceText: string): Promise<void>;
  updateNodeProgress(nodeId: string, timeSpent?: number): Promise<void>;
  complete(endingData: IEndingData): Promise<void>;
  resumeSession(): void;
  calculateProgress(): number; // 0-100 percentage
}

const ChoiceSchema = new Schema(
  {
    nodeId: {
      type: String,
      required: true,
      trim: true,
    },
    choiceId: {
      type: String,
      required: true,
      trim: true,
    },
    choiceText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    madeAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const EndingDataSchema = new Schema(
  {
    endingId: {
      type: String,
      trim: true,
    },
    endingTitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    endingType: {
      type: String,
      enum: ['good', 'bad', 'neutral', 'secret'],
    },
    isRare: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const UserStoryProgressSchema: Schema = new Schema(
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

    // Playthrough identification
    playthroughId: {
      type: String,
      required: true,
      trim: true,
    },

    // Progress tracking
    currentNodeId: {
      type: String,
      required: true,
      trim: true,
    },
    visitedNodes: [
      {
        type: String,
        trim: true,
      },
    ],
    choices: [ChoiceSchema],

    // Playthrough status
    hasCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    endingData: {
      type: EndingDataSchema,
      default: {},
    },

    // Performance metrics
    timeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    creditsSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    nodesVisited: {
      type: Number,
      default: 0,
      min: 0,
    },
    choicesMade: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Session tracking
    lastPlayedAt: {
      type: Date,
      default: Date.now,
    },
    sessionCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    currentSessionStart: {
      type: Date,
      default: Date.now,
    },

    // Playthrough metadata
    playthroughType: {
      type: String,
      enum: ['normal', 'speedrun', 'completionist'],
      default: 'normal',
    },
    difficulty: {
      type: String,
      trim: true,
    },
    customSettings: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'userStoryProgress',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserStoryProgressSchema.index({ userId: 1, storyId: 1, playthroughId: 1 }, { unique: true });
UserStoryProgressSchema.index({ userId: 1, lastPlayedAt: -1 });
UserStoryProgressSchema.index({ storyId: 1, hasCompleted: 1 });
UserStoryProgressSchema.index({ hasCompleted: 1, completedAt: -1 });
UserStoryProgressSchema.index({ 'endingData.isRare': 1 });

// Methods
UserStoryProgressSchema.methods.makeChoice = async function (
  nodeId: string,
  choiceId: string,
  choiceText: string
) {
  // Add choice to history
  this.choices.push({
    nodeId,
    choiceId,
    choiceText,
    madeAt: new Date(),
  });

  // Update tracking
  this.choicesMade += 1;
  this.lastPlayedAt = new Date();
  this.currentSessionStart = new Date();

  return this.save();
};

UserStoryProgressSchema.methods.updateNodeProgress = async function (
  nodeId: string,
  timeSpent?: number
) {
  // Add to visited nodes if not already visited
  if (!this.visitedNodes.includes(nodeId)) {
    this.visitedNodes.push(nodeId);
    this.nodesVisited += 1;
  }

  // Update current position
  this.currentNodeId = nodeId;
  this.lastPlayedAt = new Date();

  // Update time spent
  if (timeSpent && timeSpent > 0) {
    this.timeSpent += timeSpent;
  }

  return this.save();
};

UserStoryProgressSchema.methods.complete = async function (endingData: IEndingData) {
  this.hasCompleted = true;
  this.completedAt = new Date();
  this.endingData = endingData;
  this.lastPlayedAt = new Date();

  return this.save();
};

UserStoryProgressSchema.methods.resumeSession = function () {
  this.currentSessionStart = new Date();
  this.sessionCount += 1;
  return this.save();
};

UserStoryProgressSchema.methods.calculateProgress = function (): number {
  // This is a simplified progress calculation
  // In a real implementation, you'd need to know the total number of nodes in the story
  // For now, return a basic estimate based on choices made vs nodes visited
  if (this.hasCompleted) return 100;
  if (this.nodesVisited === 0) return 0;

  // Rough estimate: progress based on nodes visited (would need story total for accurate calculation)
  return Math.min(100, (this.nodesVisited / 10) * 100); // Assuming 10 nodes as baseline
};

// Static methods
UserStoryProgressSchema.statics.getUserProgress = function (
  userId: Types.ObjectId,
  storyId: Types.ObjectId
) {
  return this.find({ userId, storyId }).sort({ createdAt: -1 });
};

UserStoryProgressSchema.statics.getActivePlaythroughs = function (userId: Types.ObjectId) {
  return this.find({
    userId,
    hasCompleted: false,
  }).sort({ lastPlayedAt: -1 });
};

UserStoryProgressSchema.statics.getCompletedStories = function (userId: Types.ObjectId) {
  return this.aggregate([
    { $match: { userId, hasCompleted: true } },
    {
      $lookup: {
        from: 'Stories',
        localField: 'storyId',
        foreignField: '_id',
        as: 'story',
      },
    },
    { $unwind: '$story' },
    {
      $project: {
        storyTitle: '$story.title',
        storyId: '$story._id',
        completedAt: 1,
        endingData: 1,
        playthroughType: 1,
        timeSpent: 1,
        choicesMade: 1,
        playthroughId: 1,
      },
    },
    { $sort: { completedAt: -1 } },
  ]);
};

UserStoryProgressSchema.statics.getStoryStatistics = function (storyId: Types.ObjectId) {
  return this.aggregate([
    { $match: { storyId } },
    {
      $group: {
        _id: '$hasCompleted',
        count: { $sum: 1 },
        averageTimeSpent: { $avg: '$timeSpent' },
        totalPlaythroughs: { $sum: 1 },
      },
    },
    {
      $project: {
        status: { $cond: ['$_id', 'completed', 'in_progress'] },
        count: 1,
        averageTimeSpent: { $round: [{ $divide: ['$averageTimeSpent', 60000] }, 2] }, // minutes
        percentage: {
          $round: [{ $multiply: [{ $divide: ['$count', '$totalPlaythroughs'] }, 100] }, 2],
        },
      },
    },
  ]);
};

UserStoryProgressSchema.statics.getUserStatistics = function (userId: Types.ObjectId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalPlaythroughs: { $sum: 1 },
        completedPlaythroughs: { $sum: { $cond: ['$hasCompleted', 1, 0] } },
        totalTimeSpent: { $sum: '$timeSpent' },
        averagePlaythroughTime: { $avg: '$timeSpent' },
        totalCreditsSpent: { $sum: '$creditsSpent' },
        totalChoicesMade: { $sum: '$choicesMade' },
      },
    },
    {
      $project: {
        totalPlaythroughs: 1,
        completedPlaythroughs: 1,
        completionRate: {
          $round: [
            { $multiply: [{ $divide: ['$completedPlaythroughs', '$totalPlaythroughs'] }, 100] },
            2,
          ],
        },
        totalTimeSpentHours: { $round: [{ $divide: ['$totalTimeSpent', 3600000] }, 2] },
        averagePlaythroughTimeMinutes: {
          $round: [{ $divide: ['$averagePlaythroughTime', 60000] }, 2],
        },
        totalCreditsSpent: 1,
        totalChoicesMade: 1,
      },
    },
  ]);
};

UserStoryProgressSchema.statics.getRareEndings = function (storyId: Types.ObjectId) {
  return this.find({
    storyId,
    'endingData.isRare': true,
    hasCompleted: true,
  })
    .select({
      userId: 1,
      'endingData.endingId': 1,
      'endingData.endingTitle': 1,
      completedAt: 1,
      playthroughId: 1,
    })
    .sort({ completedAt: -1 })
    .populate('userId', 'username profile.displayName');
};

export default mongoose.model<IUserStoryProgress>('UserStoryProgress', UserStoryProgressSchema);
