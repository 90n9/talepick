import mongoose, { Document, HydratedDocument, Schema } from 'mongoose';

// System config category enum
export enum SystemConfigCategory {
  GAME = 'game',
  SECURITY = 'security',
  PAYMENT = 'payment',
  FEATURE = 'feature',
  UI = 'ui',
}

// Validation type enum
export enum ValidationType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
}

// Interfaces
export interface IValidation {
  type: ValidationType;
  required: boolean;
  min?: number;
  max?: number;
  allowedValues?: unknown[];
}

export interface ISystemConfig extends Document {
  key: string;
  value: unknown;
  description: string;
  category: SystemConfigCategory;
  isPublic: boolean;
  lastModifiedBy?: mongoose.Types.ObjectId;
  lastModifiedAt?: Date;
  version: number;
  validation: IValidation;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const validationSchema = new Schema<IValidation>(
  {
    type: {
      type: String,
      enum: Object.values(ValidationType),
      required: true,
    },
    required: {
      type: Boolean,
      required: true,
    },
    min: { type: Number },
    max: { type: Number },
    allowedValues: [{ type: Schema.Types.Mixed }],
  },
  { _id: false }
);

const systemConfigSchema = new Schema<ISystemConfig>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
      match: /^[A-Z][A-Z0-9_]*$/,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: Object.values(SystemConfigCategory),
      required: true,
    },
    isPublic: {
      type: Boolean,
      required: true,
      default: false,
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminAccount',
    },
    lastModifiedAt: { type: Date },
    version: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    validation: {
      type: validationSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'system_config',
  }
);

// Indexes
systemConfigSchema.index({ key: 1 }, { unique: true });
systemConfigSchema.index({ category: 1 });
systemConfigSchema.index({ isPublic: 1 });
systemConfigSchema.index({ lastModifiedAt: 1 });
systemConfigSchema.index({ description: 'text' });
systemConfigSchema.index({ createdAt: -1 });

// Middleware
systemConfigSchema.pre('save', function (this: HydratedDocument<ISystemConfig>) {
  if (this.isModified('value') || this.isModified('description') || this.isModified('validation')) {
    this.lastModifiedAt = new Date();
    this.version += 1;
  }
});

// Virtual for checking if config is publicly accessible
systemConfigSchema.virtual('isAccessible').get(function () {
  return this.isPublic;
});

// Static method to get all public configurations for frontend
systemConfigSchema.statics.getPublicConfigs = function () {
  return this.find({ isPublic: true }, { key: 1, value: 1, description: 1, category: 1 }).sort({
    category: 1,
    key: 1,
  });
};

// Static method to get specific configuration by key
systemConfigSchema.statics.getByKey = function (key: string) {
  return this.findOne(
    { key },
    { value: 1, description: 1, lastModifiedAt: 1, version: 1, validation: 1 }
  );
};

// Static method to get configurations by category
systemConfigSchema.statics.getByCategory = function (category: SystemConfigCategory) {
  return this.find({ category })
    .sort({ key: 1 })
    .select({ key: 1, value: 1, description: 1, isPublic: 1, lastModifiedAt: 1 });
};

// Static method to validate configuration value
systemConfigSchema.statics.validateConfigValue = async function (key: string, newValue: unknown) {
  const config = await this.findOne({ key });

  if (!config) {
    throw new Error(`Configuration ${key} not found`);
  }

  const { validation } = config;

  // Type validation
  if (validation.type === ValidationType.NUMBER) {
    if (typeof newValue !== 'number') {
      throw new Error('Value must be a number');
    }
  }

  if (validation.type === ValidationType.BOOLEAN) {
    if (typeof newValue !== 'boolean') {
      throw new Error('Value must be boolean');
    }
  }

  if (validation.type === ValidationType.STRING) {
    if (typeof newValue !== 'string') {
      throw new Error('Value must be a string');
    }
  }

  if (validation.type === ValidationType.ARRAY) {
    if (!Array.isArray(newValue)) {
      throw new Error('Value must be an array');
    }
  }

  if (validation.type === ValidationType.OBJECT) {
    if (typeof newValue !== 'object' || Array.isArray(newValue) || newValue === null) {
      throw new Error('Value must be an object');
    }
  }

  // Range validation for numbers
  if (validation.type === ValidationType.NUMBER && typeof newValue === 'number') {
    if (validation.min !== undefined && newValue < validation.min) {
      throw new Error(`Value must be at least ${validation.min}`);
    }
    if (validation.max !== undefined && newValue > validation.max) {
      throw new Error(`Value must be no more than ${validation.max}`);
    }
  }

  // String length validation
  if (validation.type === ValidationType.STRING && typeof newValue === 'string') {
    if (validation.min !== undefined && newValue.length < validation.min) {
      throw new Error(`String must be at least ${validation.min} characters`);
    }
    if (validation.max !== undefined && newValue.length > validation.max) {
      throw new Error(`String must be no more than ${validation.max} characters`);
    }
  }

  // Array length validation
  if (validation.type === ValidationType.ARRAY && Array.isArray(newValue)) {
    if (validation.min !== undefined && newValue.length < validation.min) {
      throw new Error(`Array must have at least ${validation.min} items`);
    }
    if (validation.max !== undefined && newValue.length > validation.max) {
      throw new Error(`Array must have no more than ${validation.max} items`);
    }
  }

  // Allowed values validation
  if (validation.allowedValues && !validation.allowedValues.includes(newValue)) {
    throw new Error(`Value must be one of: ${validation.allowedValues.join(', ')}`);
  }

  return true;
};

// Static method to update configuration with audit trail
systemConfigSchema.statics.updateConfig = function (
  key: string,
  newValue: unknown,
  modifiedBy: mongoose.Types.ObjectId
) {
  return this.findOneAndUpdate(
    { key },
    {
      value: newValue,
      lastModifiedBy: modifiedBy,
      lastModifiedAt: new Date(),
      $inc: { version: 1 },
    },
    { new: true, runValidators: true }
  );
};

// Static method to create new configuration
systemConfigSchema.statics.createConfig = function (
  configData: Partial<ISystemConfig>,
  createdBy: mongoose.Types.ObjectId
) {
  return this.create({
    ...configData,
    lastModifiedBy: createdBy,
    version: 1,
  });
};

// Static method to get recent configuration changes
systemConfigSchema.statics.getRecentChanges = function (days = 7) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return this.find({
    lastModifiedAt: { $gte: cutoffDate },
  })
    .sort({ lastModifiedAt: -1 })
    .populate('lastModifiedBy', 'username email profile.displayName')
    .select({
      key: 1,
      value: 1,
      description: 1,
      category: 1,
      lastModifiedBy: 1,
      lastModifiedAt: 1,
      version: 1,
    });
};

// Static method to bulk update configurations
systemConfigSchema.statics.bulkUpdateConfigs = function (
  updates: Array<{ key: string; value: unknown }>,
  modifiedBy: mongoose.Types.ObjectId
) {
  const bulkOps = updates.map((update) => ({
    updateOne: {
      filter: { key: update.key },
      update: {
        value: update.value,
        lastModifiedBy: modifiedBy,
        lastModifiedAt: new Date(),
        $inc: { version: 1 },
      },
    },
  }));

  return this.bulkWrite(bulkOps);
};

// Static method to export configurations by category
systemConfigSchema.statics.exportConfigs = function (category?: SystemConfigCategory) {
  const filter = category ? { category } : {};

  return this.find(filter)
    .sort({ category: 1, key: 1 })
    .select({ key: 1, value: 1, description: 1, category: 1, validation: 1 })
    .lean();
};

// Static method to import configurations
systemConfigSchema.statics.importConfigs = function (
  configs: Array<Partial<ISystemConfig>>,
  importedBy: mongoose.Types.ObjectId
) {
  const results = {
    imported: 0,
    updated: 0,
    errors: [] as Array<{ key: string; error: string }>,
  };

  const operations = configs.map(async (config) => {
    try {
      const existing = await this.findOne({ key: config.key });

      if (existing) {
        await this.updateOne(
          { key: config.key },
          {
            value: config.value,
            description: config.description,
            category: config.category,
            isPublic: config.isPublic,
            validation: config.validation,
            lastModifiedBy: importedBy,
            lastModifiedAt: new Date(),
            $inc: { version: 1 },
          }
        );
        results.updated++;
      } else {
        await this.create({
          ...config,
          lastModifiedBy: importedBy,
          version: 1,
        });
        results.imported++;
      }
    } catch (error) {
      results.errors.push({
        key: config.key || 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return Promise.all(operations).then(() => results);
};

// Method to update configuration value
systemConfigSchema.methods.setValue = function (
  newValue: unknown,
  modifiedBy: mongoose.Types.ObjectId
) {
  this.value = newValue;
  this.lastModifiedBy = modifiedBy;
  this.lastModifiedAt = new Date();
  this.version += 1;
  return this.save();
};

export const SystemConfig = mongoose.model<ISystemConfig>('SystemConfig', systemConfigSchema);
