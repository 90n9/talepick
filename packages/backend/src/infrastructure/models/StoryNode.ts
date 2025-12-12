import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISegment {
  type: string; // 'text' | 'image' | 'video'
  url?: string;
  text?: string;
  duration?: number; // auto-advance duration in ms
}

export interface IChoice {
  id: string;
  text: string;
  nextNodeId?: string; // or null for ending
  requirements?: {
    achievementId?: string;
    minCredits?: number;
    playedStoryId?: string;
  };
  costs?: {
    credits?: number;
  };
}

export interface IEndingData {
  title?: string;
  description?: string;
  type?: string; // 'good' | 'bad' | 'neutral' | 'secret'
  isSecret?: boolean;
  isRare?: boolean;
}

export interface IAnalytics {
  totalVisits?: number;
  choiceDistribution?: Array<{
    choiceId: string;
    count: number;
  }>;
}

export interface ILayout {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface IEditorMetadata {
  createdBy?: Types.ObjectId;
  lastModifiedBy?: Types.ObjectId;
  editorVersion?: string;
  lastEditorAction?: string;
}

export interface IStoryNode extends Document {
  storyId: Types.ObjectId; // references Stories
  nodeId: string; // unique within story

  segments: ISegment[];

  media: {
    bgMusicAssetId?: string;
    backgroundImageAssetId?: string;
    bgMusicUrl?: string;
    backgroundImageUrl?: string;
  };

  choices: IChoice[];

  rewards: {
    achievementId?: string;
    credits?: number;
    avatarIds?: string[]; // references Avatars.avatarId
  };

  isEnding: boolean;
  endingData?: IEndingData;

  analytics?: IAnalytics;

  // Visual editor support
  layout?: ILayout;

  editorMetadata?: IEditorMetadata;

  // Methods
  recordVisit(): Promise<void>;
  recordChoice(choiceId: string): Promise<void>;
}

const SegmentSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['text', 'image', 'video'],
      required: true,
    },
    url: {
      type: String,
      trim: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    duration: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const ChoiceSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    nextNodeId: {
      type: String,
      trim: true,
    },
    requirements: {
      achievementId: {
        type: String,
        trim: true,
      },
      minCredits: {
        type: Number,
        min: 0,
      },
      playedStoryId: {
        type: String,
        trim: true,
      },
    },
    costs: {
      credits: {
        type: Number,
        min: 0,
      },
    },
  },
  { _id: false }
);

const StoryNodeSchema: Schema = new Schema(
  {
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },
    nodeId: {
      type: String,
      required: true,
      trim: true,
    },

    segments: [SegmentSchema],

    media: {
      bgMusicAssetId: {
        type: String,
        trim: true,
      },
      backgroundImageAssetId: {
        type: String,
        trim: true,
      },
      bgMusicUrl: {
        type: String,
        trim: true,
      },
      backgroundImageUrl: {
        type: String,
        trim: true,
      },
    },

    choices: [ChoiceSchema],

    rewards: {
      achievementId: {
        type: String,
        trim: true,
      },
      credits: {
        type: Number,
        min: 0,
      },
      avatarIds: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    isEnding: {
      type: Boolean,
      default: false,
    },
    endingData: {
      title: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      description: {
        type: String,
        trim: true,
        maxlength: 500,
      },
      type: {
        type: String,
        enum: ['good', 'bad', 'neutral', 'secret'],
      },
      isSecret: {
        type: Boolean,
        default: false,
      },
      isRare: {
        type: Boolean,
        default: false,
      },
    },

    analytics: {
      totalVisits: {
        type: Number,
        default: 0,
        min: 0,
      },
      choiceDistribution: [
        {
          choiceId: {
            type: String,
            required: true,
            trim: true,
          },
          count: {
            type: Number,
            default: 0,
            min: 0,
          },
        },
      ],
    },

    // Visual editor support
    layout: {
      x: {
        type: Number,
      },
      y: {
        type: Number,
      },
      width: {
        type: Number,
        min: 1,
      },
      height: {
        type: Number,
        min: 1,
      },
    },

    editorMetadata: {
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'AdminAccount',
      },
      lastModifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'AdminAccount',
      },
      editorVersion: {
        type: String,
        trim: true,
      },
      lastEditorAction: {
        type: String,
        trim: true,
      },
    },
  },
  {
    collection: 'story_nodes', // Manual override: StoryNode → storynodes (awkward) → story_nodes (better)
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
StoryNodeSchema.index({ storyId: 1 });
StoryNodeSchema.index({ nodeId: 1, storyId: 1 }, { unique: true });
StoryNodeSchema.index({ isEnding: 1 });
StoryNodeSchema.index({ 'analytics.totalVisits': -1 });

// Methods
StoryNodeSchema.methods.recordVisit = function (): Promise<void> {
  if (!this.analytics) {
    this.analytics = { totalVisits: 0, choiceDistribution: [] };
  }
  this.analytics.totalVisits = (this.analytics.totalVisits || 0) + 1;
  return this.save().then(() => undefined);
};

StoryNodeSchema.methods.recordChoice = function (choiceId: string): Promise<void> {
  if (!this.analytics) {
    this.analytics = { totalVisits: 0, choiceDistribution: [] };
  }
  if (!this.analytics.choiceDistribution) {
    this.analytics.choiceDistribution = [];
  }

  const choiceIndex = this.analytics.choiceDistribution.findIndex(
    (choice: { choiceId: string; count: number }) => choice.choiceId === choiceId
  );

  if (choiceIndex >= 0) {
    this.analytics.choiceDistribution[choiceIndex].count += 1;
  } else {
    this.analytics.choiceDistribution.push({
      choiceId,
      count: 1,
    });
  }

  return this.save().then(() => undefined);
};

// Static methods
StoryNodeSchema.statics.getStoryNodes = function (storyId: Types.ObjectId) {
  return this.find({ storyId }).sort({ nodeId: 1 });
};

StoryNodeSchema.statics.getStartingNode = function (storyId: Types.ObjectId) {
  return this.findOne({
    storyId,
    nodeId: 'start_node',
  });
};

StoryNodeSchema.statics.getStoryEndings = function (storyId: Types.ObjectId) {
  return this.find({
    storyId,
    isEnding: true,
  }).select({
    nodeId: 1,
    'endingData.title': 1,
    'endingData.type': 1,
    'endingData.isSecret': 1,
    'endingData.isRare': 1,
  });
};

StoryNodeSchema.statics.updateNodeLayout = function (
  storyId: Types.ObjectId,
  nodeId: string,
  layout: ILayout,
  modifiedBy: Types.ObjectId
) {
  return this.updateOne(
    { storyId, nodeId },
    {
      $set: {
        layout,
        'editorMetadata.lastModifiedBy': modifiedBy,
        'editorMetadata.lastEditorAction': 'move_node',
      },
    }
  );
};

export const StoryNode = mongoose.model<IStoryNode>('StoryNode', StoryNodeSchema);
export default StoryNode;
