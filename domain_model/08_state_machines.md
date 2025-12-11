# Domain Model Specification (Stage 2) - Part 8: State Machines

## 8. DOMAIN STATE MACHINES (For key flows)

### Credit Refill State Machine (เครื่องจัดสถานะการเติมเต็มเครดิต)
```mermaid
stateDiagram-v2
    [*] --> CheckingBalance
    CheckingBalance --> BelowMaximum: balance < maxBalance
    CheckingBalance --> AtMaximum: balance >= maxBalance
    BelowMaximum --> AddingCredits
    AddingCredits --> UpdatingWallet
    UpdatingWallet --> LoggingTransaction
    LoggingTransaction --> NotifyingUser
    NotifyingUser --> [*]
    AtMaximum --> [*]

    note right of AddingCredits
        Add configured amount
        Respect maximum capacity
    end note
```

### Story Lifecycle State Machine (เครื่องจัดสถานะวงจรชีวิตเรื่อง)
```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Validating: Submit for review
    Validating --> Approved: Passes validation
    Validating --> Draft: Validation fails
    Approved --> Scheduled: Schedule publication
    Approved --> Published: Publish immediately
    Scheduled --> Published: Publication date reached
    Published --> Updating: Edit published
    Updating --> Published: Save changes
    Published --> Archived: Archive story
    Archived --> Draft: Restore for editing

    note right of Validating
        Check structure
        Validate media
        Verify requirements
    end note

    note right of Published
        Publicly visible
        Analytics tracking
        User interactions
    end note
```

### User Session State Machine (เครื่องจัดสถานะเซสชันผู้ใช้)
```mermaid
stateDiagram-v2
    [*] --> Guest
    Guest --> Registered: Complete registration
    Guest --> Expired: 24h inactivity
    Registered --> Active: Email verified
    Registered --> Suspended: Policy violation
    Active --> Suspended: Account issues
    Suspended --> Active: Issue resolved
    Active --> Inactive: 90d no activity
    Inactive --> Active: Return to platform
    Expired --> [*]

    note right of Guest
        Limited credits
        No persistent data
        Session-only
    end note

    note right of Active
        Full features
        Persistent progress
        Social access
    end note
```

### Scene Navigation State Machine (เครื่องจัดสถานะการนำทางฉาก)
```mermaid
stateDiagram-v2
    [*] --> LoadingScene
    LoadingScene --> SceneReady: Assets loaded
    SceneReady --> PlayingSegments: Begin playback
    PlayingSegments --> ShowingChoices: Text complete
    ShowingChoices --> ProcessingChoice: Choice selected
    ProcessingChoice --> ValidatingChoice: Check requirements
    ValidatingChoice --> DeductingCredits: Has sufficient credits
    ValidatingChoice --> ShowingError: Insufficient credits
    DeductingCredits --> TransitioningScene: Payment successful
    TransitioningScene --> LoadingScene: Load next scene
    ShowingError --> ShowingChoices: User acknowledges
    SceneReady --> EndingReached: Scene is ending
    EndingReached --> [*]

    note right of ValidatingChoice
        Check credits
        Verify achievements
        Validate prerequisites
    end note
```

### Achievement Progress State Machine (เครื่องจัดสถานะความคืบหน้าความสำเร็จ)
```mermaid
stateDiagram-v2
    [*] --> Locked
    Locked --> InProgress: Activity started
    InProgress --> Progressing: Milestone reached
    Progressing --> InProgress: Continue working
    Progressing --> Unlocked: Conditions met
    Unlocked --> Rewarded: Process rewards
    Rewarded --> Notified: Send notification
    Notified --> Completed
    Locked --> Unlocked: Direct unlock
    Completed --> [*]

    note right of Progressing
        Update percentage
        Track specific metrics
        Check thresholds
    end note

    note right of Unlocked
        Award credits
        Unlock avatars
        Enable content
    end note
```

### Review Moderation State Machine (เครื่องจัดสถานะการตรวจสอบรีวิว)
```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> AutomatedCheck: Initial processing
    AutomatedCheck --> AutoApproved: Passes filters
    AutomatedCheck --> Flagged: Needs review
    AutomatedCheck --> QueuedForReview: Uncertain
    Flagged --> ManualReview: Moderator action
    QueuedForReview --> ManualReview: Moderator picks up
    ManualReview --> Approved: Content acceptable
    ManualReview --> Rejected: Content violates rules
    ManualReview --> Edited: Requires changes
    Approved --> Published: Publicly visible
    Rejected --> [*]
    Edited --> Pending: Resubmit after changes
    AutoApproved --> Published
    Published --> Reported: User reports
    Reported --> ManualReview: Re-examine
```