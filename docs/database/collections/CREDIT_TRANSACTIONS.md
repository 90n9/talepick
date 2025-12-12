# CreditTransactions Collection

## Mongoose Model Reference
- **Model File**: CreditTransaction.ts (singular)
- **Model Class**: CreditTransaction (singular)
- **Collection**: credit_transactions (plural, with underscores for readability)


**Purpose**: Credit transaction history and economy tracking

## Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // references Users
  transactionType: String,    // 'earn' | 'spend' | 'refund' | 'bonus'
  source: String,             // 'choice' | 'review' | 'achievement' | 'refill' | 'purchase'
  amount: Number,
  balanceBefore: Number,
  balanceAfter: Number,
  relatedId: String,
  description: String,
  metadata: {
    storyTitle: String,
    choiceText: String,
    achievementName: String
  },

  // Soft Delete Support
  deletedAt: Date,
  deletedBy: ObjectId,
  deleteReason: String,

  createdAt: Date,
  expiresAt: Date             // for temporary credits
}
```

## Key Indexes

- `userId` + `createdAt`
- `transactionType`
- `source`
- `deletedAt` (sparse)

## Query Examples

```javascript
// Get user's credit balance
const getUserBalance = (userId) => {
  const latestTransaction = db.CreditTransactions.findOne(
    { userId },
    { sort: { createdAt: -1 } }
  );
  return latestTransaction?.balanceAfter || 0;
};

// Get user's transaction history with pagination
db.CreditTransactions.find({
  userId: ObjectId("user_id"),
  deletedAt: null
})
.sort({ createdAt: -1 })
.skip(20)
.limit(10);

// Get credit spending on story choices
db.CreditTransactions.find({
  userId: ObjectId("user_id"),
  transactionType: "spend",
  source: "choice"
})
.sort({ createdAt: -1 })
.select({
  amount: 1,
  description: 1,
  "metadata.storyTitle": 1,
  "metadata.choiceText": 1,
  createdAt: 1
});

// Get credit earnings from achievements
db.CreditTransactions.aggregate([
  { $match: {
    userId: ObjectId("user_id"),
    transactionType: "earn",
    source: "achievement"
  }},
  { $group: {
    _id: null,
    totalEarned: { $sum: "$amount" },
    transactionCount: { $sum: 1 },
    achievements: { $addToSet: "$metadata.achievementName" }
  }},
  { $project: {
    totalEarned: 1,
    transactionCount: 1,
    uniqueAchievements: { $size: "$achievements" },
    achievements: 1
  }}
]);

// Get daily credit refill transactions
db.CreditTransactions.find({
  source: "refill",
  createdAt: {
    $gte: new Date(new Date().setHours(0, 0, 0, 0))
  }
})
.groupBy({
  _id: "$userId",
  refills: { $sum: 1 }
});

// Process credit transaction
const processTransaction = (userId, type, source, amount, metadata = {}) => {
  const balanceBefore = getUserBalance(userId);
  const balanceAfter = type === 'spend'
    ? balanceBefore - amount
    : balanceBefore + amount;

  if (balanceAfter < 0) {
    throw new Error("Insufficient credits");
  }

  return db.CreditTransactions.insertOne({
    userId,
    transactionType: type,
    source,
    amount,
    balanceBefore,
    balanceAfter,
    relatedId: metadata.relatedId,
    description: generateDescription(type, source, metadata),
    metadata,
    createdAt: new Date()
  });
};

// Get credit statistics for user
db.CreditTransactions.aggregate([
  { $match: {
    userId: ObjectId("user_id"),
    deletedAt: null
  }},
  { $group: {
    _id: "$transactionType",
    totalAmount: { $sum: "$amount" },
    transactionCount: { $sum: 1 },
    sources: { $addToSet: "$source" }
  }},
  { $project: {
    transactionType: "$_id",
    totalAmount: 1,
    transactionCount: 1,
    averageAmount: {
      $round: [{ $divide: ["$totalAmount", "$transactionCount"] }, 2]
    },
    sources: 1
  }}
]);

// Track credit spending by story
db.CreditTransactions.aggregate([
  { $match: {
    transactionType: "spend",
    source: "choice",
    createdAt: {
      $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    }
  }},
  { $group: {
    _id: "$metadata.storyTitle",
    totalSpent: { $sum: "$amount" },
    transactionCount: { $sum: 1 },
    uniqueUsers: { $addToSet: "$userId" }
  }},
  { $project: {
    storyTitle: "$_id",
    totalSpent: 1,
    transactionCount: 1,
    uniqueUsers: { $size: "$uniqueUsers" },
    averageSpentPerUser: {
      $round: [{ $divide: ["$totalSpent", { $size: "$uniqueUsers" }] }, 2]
    }
  }},
  { $sort: { totalSpent: -1 } }
]);

// Get credit economy statistics
db.CreditTransactions.aggregate([
  { $match: {
    deletedAt: null,
    createdAt: {
      $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    }
  }},
  { $group: {
    _id: {
      transactionType: "$transactionType",
      source: "$source"
    },
    totalAmount: { $sum: "$amount" },
    transactionCount: { $sum: 1 },
    uniqueUsers: { $addToSet: "$userId" }
  }},
  { $group: {
    _id: "$_id.transactionType",
    sources: {
      $push: {
        source: "$_id.source",
        totalAmount: "$totalAmount",
        transactionCount: "$transactionCount",
        uniqueUsers: { $size: "$uniqueUsers" }
      }
    },
    totalTypeAmount: { $sum: "$totalAmount" },
    totalTypeTransactions: { $sum: "$transactionCount" }
  }},
  { $sort: { "_id": 1 } }
]);

// Find users with low credits for refill
db.CreditTransactions.aggregate([
  { $match: {
    createdAt: {
      $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    }
  }},
  { $sort: { createdAt: -1 } },
  { $group: {
    _id: "$userId",
    latestBalance: { $first: "$balanceAfter" },
    lastTransaction: { $first: "$createdAt" }
  }},
  { $match: {
    latestBalance: { $lt: 20 } // Less than 20 credits
  }},
  { $lookup: {
    from: "Users",
    localField: "_id",
    foreignField: "_id",
    as: "user"
  }},
  { $unwind: "$user" },
  { $project: {
    userId: "$_id",
    username: "$user.username",
    currentBalance: "$latestBalance",
    lastTransaction: "$lastTransaction"
  }}
]);

// Refund transaction
const refundTransaction = (originalTransactionId, reason) => {
  const original = db.CreditTransactions.findOne({
    _id: ObjectId(originalTransactionId)
  });

  if (!original || original.transactionType !== 'spend') {
    throw new Error("Invalid transaction for refund");
  }

  return db.CreditTransactions.insertOne({
    userId: original.userId,
    transactionType: "refund",
    source: original.source,
    amount: original.amount,
    balanceBefore: original.balanceAfter,
    balanceAfter: original.balanceAfter + original.amount,
    relatedId: originalTransactionId,
    description: `Refund: ${reason}`,
    metadata: {
      originalTransactionId,
      refundReason: reason,
      ...original.metadata
    },
    createdAt: new Date()
  });
};

// Get credit refill patterns
db.CreditTransactions.aggregate([
  { $match: {
    source: "refill",
    createdAt: {
      $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  }},
  { $group: {
    _id: {
      year: { $year: "$createdAt" },
      month: { $month: "$createdAt" },
      day: { $dayOfMonth: "$createdAt" },
      hour: { $hour: "$createdAt" }
    },
    refillCount: { $sum: 1 },
    totalCredits: { $sum: "$amount" }
  }},
  { $sort: { "_id": 1 } }
]);

// Soft delete transaction (admin use)
db.CreditTransactions.updateOne(
  { _id: ObjectId("transaction_id") },
  {
    $set: {
      deletedAt: new Date(),
      deletedBy: ObjectId("admin_id"),
      deleteReason: "Fraudulent activity detected"
    }
  }
);

// Get monthly credit trends
db.CreditTransactions.aggregate([
  { $match: {
    deletedAt: null,
    createdAt: {
      $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
    }
  }},
  { $group: {
    _id: {
      year: { $year: "$createdAt" },
      month: { $month: "$createdAt" }
    },
    earned: {
      $sum: {
        $cond: [{ $eq: ["$transactionType", "earn"] }, "$amount", 0]
      }
    },
    spent: {
      $sum: {
        $cond: [{ $eq: ["$transactionType", "spend"] }, "$amount", 0]
      }
    },
    transactions: { $sum: 1 }
  }},
  { $sort: { "_id": 1 } },
  { $project: {
    month: {
      $dateFromParts: {
        year: "$_id.year",
        month: "$_id.month"
      }
    },
    earned: 1,
    spent: 1,
    netFlow: { $subtract: ["$earned", "$spent"] },
    transactions: 1
  }}
]);
```

## Transaction Types

| Type | Description | Balance Impact |
|------|-------------|----------------|
| **earn** | Credits added to user account | + |
| **spend** | Credits used for choices/features | - |
| **refund** | Credits returned to user | + |
| **bonus** | Special promotional credits | + |

## Transaction Sources

| Source | Type | Description |
|--------|------|-------------|
| **choice** | spend | Credits spent on story choices |
| **review** | earn | Bonus credits for writing reviews |
| **achievement** | earn | Achievement completion rewards |
| **refill** | earn | Automatic credit refills |
| **purchase** | earn | Real money credit purchases |
| **admin** | earn/bonus | Admin-granted credits |

## Credit System Mechanics

### Automatic Refills
```javascript
// Check if user needs credit refill
const checkCreditRefill = (userId) => {
  const lastRefill = db.CreditTransactions.findOne({
    userId,
    source: "refill"
  }, { sort: { createdAt: -1 } });

  const user = db.Users.findOne({ _id: userId });
  const timeSinceRefill = Date.now() - (lastRefill?.createdAt || 0);
  const refillInterval = 5 * 60 * 1000; // 5 minutes

  if (timeSinceRefill >= refillInterval && user.gameStats.credits < user.gameStats.maxCredits) {
    const refillAmount = Math.min(
      user.gameStats.maxCredits - user.gameStats.credits,
      20 // Max 20 credits per refill
    );

    return processTransaction(userId, 'earn', 'refill', refillAmount, {
      refillType: 'automatic',
      interval: '5_minutes'
    });
  }
};
```

### Transaction Validation
```javascript
const validateTransaction = (userId, type, amount) => {
  const balance = getUserBalance(userId);

  // Check for negative balance
  if (type === 'spend' && balance < amount) {
    throw new Error("Insufficient credits");
  }

  // Check for suspicious activity
  const recentTransactions = db.CreditTransactions.find({
    userId,
    transactionType: "spend",
    createdAt: { $gte: new Date(Date.now() - 60000) } // Last minute
  });

  if (recentTransactions.length > 10) {
    // Flag for potential abuse
    db.SecurityEvents.insertOne({
      userId,
      eventType: "rapid_credit_spending",
      severity: "medium",
      description: `User spent credits ${recentTransactions.length} times in 1 minute`,
      timestamp: new Date()
    });
  }
};
```

## Economic Analytics

### Credit Flow Analysis
```javascript
const getCreditFlowAnalysis = () => {
  return db.CreditTransactions.aggregate([
    { $match: {
      deletedAt: null,
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }},
    { $group: {
      _id: null,
      totalEarned: {
        $sum: {
          $cond: [{ $in: ["$transactionType", ["earn", "refund", "bonus"]] }, "$amount", 0]
        }
      },
      totalSpent: {
        $sum: {
          $cond: [{ $eq: ["$transactionType", "spend"] }, "$amount", 0]
        }
      },
      totalTransactions: { $sum: 1 },
      activeUsers: { $addToSet: "$userId" }
    }},
    { $project: {
      totalEarned: 1,
      totalSpent: 1,
      netFlow: { $subtract: ["$totalEarned", "$totalSpent"] },
      totalTransactions: 1,
      activeUsers: { $size: "$activeUsers" },
      averageTransactionsPerUser: {
        $round: [{ $divide: ["$totalTransactions", { $size: "$activeUsers" }] }, 2]
      }
    }}
  ]);
};
```

## Integration Points

- **Users**: Balance tracking and limits
- **UserStoryProgress**: Credit spending on choices
- **Achievements**: Credit rewards for completion
- **Reviews**: Bonus credit incentives
- **SecurityEvents**: Fraud detection and monitoring
- **Analytics**: Economic health monitoring

## Performance Considerations

### Efficient Balance Queries
```javascript
// Use latest transaction for balance
const balance = db.CreditTransactions.findOne(
  { userId },
  { balanceAfter: 1 },
  { sort: { createdAt: -1 } }
)?.balanceAfter || 0;
```

### Batch Processing
- Process credit refills in batches
- Aggregate transactions for analytics
- Use indexes for time-based queries

## Security Measures

### Fraud Detection
- Monitor rapid credit spending
- Flag unusual transaction patterns
- Automatic account locks for suspected abuse

### Transaction Integrity
- Always validate balance before spending
- Use atomic operations for updates
- Maintain complete audit trail