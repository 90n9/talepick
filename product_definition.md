# Stage 1 — Product Definition

## 1. FEATURE LIST

### Core Game System
| Feature Name | Description | Trigger/User Action | Inputs Required | System Outputs / Behavior |
|--------------|-------------|---------------------|-----------------|--------------------------|
| Story Selection | Browse and select interactive stories from library | Click on story card | Story preferences, search terms | Display story list with filters, show story detail modal |
| **Multimedia Story Playback** | Play through interactive story scenes with video/image/text segments | Click "เล่นเลย" button | Story ID, current scene ID | Display scene with timed segments (video, images, text overlays), background audio |
| Choice Selection | Make branching decisions that affect story outcome | Click on choice button | Choice ID, required achievements/credits | Navigate to next scene based on choice mapping, validate prerequisites |
| **Segment Progression** | Automatic advancement through story segments with timing | Automatic after segment completion | Segment duration, user interactions | Progress through text/image/video segments with smooth transitions |
| **Story Path Completion** | Reach different story endings based on choices | Complete story path | Final scene state | Show ending type (normal/special/perfect), completion statistics, unlock rewards |
| **Story History Tracking** | Review complete journey through completed stories | Access history page | Story completion data | Display path taken, choices made, time spent, achievements earned |

### Player Account System
| Feature Name | Description | Trigger/User Action | Inputs Required | System Outputs / Behavior |
|--------------|-------------|---------------------|-----------------|--------------------------|
| Guest Access | Play stories without registration | Click "เข้าผ่าน Guest" | None | Limited credits, session-based progress, basic achievements |
| User Registration | Create permanent account | Click "สมัครใหม่" | Email, password, username | Create account, send OTP verification, initialize profile |
| Email Verification | Verify email address via OTP | After registration | 6-digit OTP code | Confirm email, activate account, unlock full features |
| Password Reset | Recover forgotten password | Click "ลืมรหัสผ่าน" | Email, OTP, new password | Send reset email, verify OTP, update password |
| **Profile Customization** | Update user profile with unlocked avatars and bios | Access Profile page | Avatar selection (unlocked), bio text | Update profile data, display achievement badges, avatar collection |
| Login/Logout | Authenticate session with persistence | Click login/logout buttons | Email, password | Create/end authenticated session, restore progress |

### Credit & Refill System
| Feature Name | Description | Trigger/User Action | Inputs Required | System Outputs / Behavior |
|--------------|-------------|---------------------|-----------------|--------------------------|
| **Choice-Based Deduction** | Consume credits for making story choices | Click choice button | Choice cost, current balance | Deduct credits, check balance, enable/disable choices |
| **Time-Based Refill** | Automatic credit replenishment every 5 minutes | Timer-based (5-minute intervals) | Refill schedule, user tier | Add credits to balance, show refill notification |
| **Review Rating Rewards** | Earn bonus credits for rating stories | Rate completed story | Star rating, optional review text | Award credits based on rating quality, encourage engagement |
| **Dynamic Credit Display** | Real-time credit counter with visual feedback | Persistent UI display | Current balance, transaction history | Animated counter updates, credit change notifications |
| **Credit Purchase System** | Optional credit purchases for immediate access | Click "เติมเครดิต" | Payment method, amount | Process payment, add credits immediately |
| **Insufficient Credits Handling** | Block choices when credits insufficient | Attempt choice without credits | Choice cost, balance check | Show credit upgrade prompt, wait for refill timer |

### Rating & Review System
| Feature Name | Description | Trigger/User Action | Inputs Required | System Outputs / Behavior |
|--------------|-------------|---------------------|-----------------|--------------------------|
| **Story Rating with Credits** | Rate completed stories and earn credits | After story completion | 1-5 star rating | Save rating, update story average, award credit bonus |
| **Review Submission** | Write detailed reviews for completed stories | After rating | Review text (max 500 chars) | Save review, show in story details, notify admin |
| **Admin Review Replies** | Admin can respond to user reviews | Admin action | Review ID, reply text | Add admin reply, notify user, improve engagement |
| **Review Moderation** | Approve/reject/flag inappropriate reviews | Admin moderation | Review content, flags | Moderate content, maintain community standards |
| **Rating Analytics** | Display detailed rating breakdowns | View story details | Story rating data | Show rating distribution, recent reviews, trends |

### Achievement & Progression System
| Feature Name | Description | Trigger/User Action | Inputs Required | System Outputs / Behavior |
|--------------|-------------|---------------------|-----------------|--------------------------|
| **Story Completion Achievements** | Unlock achievements based on story paths | Complete specific story paths | Ending type, paths taken | Unlock achievement, award credits/avatar |
| **Conditional Choice Unlocks** | Special choices require specific achievements | Make choice with prerequisites | Required achievement, choice ID | Enable/disable choices based on user achievements |
| **Avatar Collection System** | Unlock and collect profile avatars | Earn specific achievements | Achievement-avatar mapping | Add avatar to collection, allow profile customization |
| **Progress Tracking UI** | Visual progress bars for incomplete achievements | During gameplay | User progress, achievement criteria | Show progress indicators, next steps, completion percentage |
| **Multiple Ending Types** | Track different story endings per story | Complete story multiple times | Story ID, ending type | Display ending collection, encourage replay |

### AI-Enhanced Content System
| Feature Name | Description | Trigger/User Action | Inputs Required | System Outputs / Behavior |
|--------------|-------------|---------------------|-----------------|--------------------------|
| **AI Scene Generation** | Generate scene descriptions using Gemini AI | Admin content creation | Scene context, desired tone | Generate AI content suggestions, editable by admin |
| **AI Content Suggestions** | Automated ideas for story branches | Story editing | Current story structure | Suggest branching options, plot developments |
| **AI-Assisted Review Analysis** | Analyze review sentiment automatically | New review submission | Review text content | Categorize sentiment, flag for moderation, suggest replies |

### Admin-Only Functions
| Feature Name | Description | Trigger/User Action | Inputs Required | System Outputs / Behavior |
|--------------|-------------|---------------------|-----------------|--------------------------|
| **Visual DAG Story Editor** | Node-based editing of story branching structure | Admin story editing | Story data, node connections | Interactive canvas, drag-drop nodes, real-time validation |
| **Import/Export Stories** | Transfer stories in JSON format | Admin tools | Story JSON file or data | Import new stories, export for backup/sharing |
| **Story Template System** | Use pre-built templates for common story patterns | Create new story | Template selection, customization | Initialize story with structure, accelerate creation |
| **Advanced Analytics Dashboard** | Real-time metrics with interactive charts | Admin analytics | Date ranges, filters, story selections | Display DAU/MAU, conversion funnels, story performance heatmaps |
| **User Behavior Analytics** | Track detailed user engagement patterns | Admin reports | User segments, time periods | Show choice patterns, drop-off points, completion rates |
| **Credit Economy Management** | Configure credit system parameters | System settings | Refill rates, costs, bonuses | Update credit economics, monitor economic balance |
| **Content Validation System** | Automated checking of story structure | Story publishing | Story graph, node connections | Validate for orphan nodes, infinite loops, unreachable endings |

### Media & Asset Management
| Feature Name | Description | Trigger/User Action | Inputs Required | System Outputs / Behavior |
|--------------|-------------|---------------------|-----------------|--------------------------|
| **Multi-Format Asset Upload** | Support for images, videos, audio files | Media library | File uploads, metadata | Store assets, generate thumbnails, optimize for web |
| **Asset Usage Analytics** | Track how assets are used across stories | Media management | Asset ID, usage data | Display usage statistics, identify unused assets |
| **Drag-Drop Media Integration** | Seamless media integration in story editor | Scene editing | Media library assets | Add media to scenes with visual feedback |
| **Asset Optimization** | Automatic compression and format conversion | File upload | Original files | Optimize for web delivery, maintain quality standards |

### Social & Community Features
| Feature Name | Description | Trigger/User Action | Inputs Required | System Outputs / Behavior |
|--------------|-------------|---------------------|-----------------|--------------------------|
| **Web Share API Integration** | Share story endings and achievements | After story completion | Share platform, ending data | Generate shareable content, track viral metrics |
| **Friend System** | Connect with other players | Social features | User search, friend requests | Build social network, enable sharing between friends |
| **Activity Feed** | Display friend achievements and story completions | Dashboard/social page | Friend activity data | Show recent achievements, completions, ratings |

## 2. PLAYER EXPERIENCE SPEC (PXS)

### 2.1 Player Roles

#### Guest Player
- **Permissions**: Limited credits (50 max), no avatar customization, basic story access
- **Features**: Can play stories, earn achievements (not saved), view story library
- **Restrictions**: Cannot rate/review stories, unlock avatars, save progress, access social features
- **Conversion Incentives**: Credit caps, achievement loss prompts, social feature locks

#### Registered Player
- **Permissions**: Full credit system (200 max), complete achievement tracking, avatar collection
- **Features**: Profile customization, review/rating system, social sharing, friend connections
- **Benefits**: Higher credit refill rate (20 per 5 minutes), achievement credit bonuses, persistent progress
- **Advanced Features**: Access to premium stories (achievement-gated), social leaderboards, activity feeds

### 2.2 Player Journey

#### Landing Page → Story Discovery
- **State**: Immersive library browsing with rich story previews
- **Transitions**: Click story → Full-screen story detail; Hover → Quick preview modal
- **Permissions**: All users browse, registered see personalized recommendations
- **Content Visibility**: Story cards with animated previews, genre badges, rating stars, playtime estimates

#### Story Detail → Immersive Playback
- **State**: Full-screen story player with multimedia content
- **Transitions**: Click "เล่นเลย" → Full-screen immersive mode; Click preview → Sample scene
- **Permissions**: Credit validation before play, achievement checks for special choices
- **Content Visibility**: Story metadata, media gallery, rating breakdown, completion statistics

#### Multimedia Story Experience
- **State**: Full-screen immersive player with video backgrounds, timed text overlays
- **Transitions**: Automatic segment progression; Click choices → Branch to new scene
- **Permissions**: Real-time credit deduction; achievement-based choice unlocking
- **Content Visibility**: Video/image backgrounds, animated text, choice buttons with credit costs

#### Dynamic Choice System
- **State**: Strategic choice selection with resource management
- **Transitions**: Click choice → Credit deduction → Scene transition; Hover → Choice preview
- **Permissions**: Achievement validation for special choices; credit requirement checking
- **Content Visibility**: Choice costs, required achievements (locked choices), choice consequences preview

#### Story Completion & Rewards
- **State**: Ending reveal with achievement unlocks and statistics
- **Transitions**: Rate story → Credit reward; Share ending → Social sharing; Play again → Story restart
- **Permissions**: Full rating/review access for registered users; achievement unlocking for all
- **Content Visibility**: Ending type (normal/special/perfect), path visualization, new unlocks

### 2.3 Gameplay UX Details

#### Advanced Scene Structure
- **Segment Types**: Video backgrounds (60% screen), text overlays (timed), choice panels (bottom), character avatars
- **Timing System**: Automatic segment advancement (3-8 seconds per segment), manual skip option
- **Audio Integration**: Background music per scene, sound effects for choices, ambient audio
- **Visual Effects**: Smooth transitions between scenes, parallax scrolling, choice animation feedback

#### Immersive Player Controls
- **Full-Screen Mode**: True immersive experience with minimal UI during scenes
- **Progressive Disclosure**: Choices appear after text completion, building anticipation
- **Visual Story Path**: Mini-map showing current position in story graph (collapsed by default)
- **Resource Management UI**: Credit counter with visual feedback, achievement notifications

#### Advanced Branching Mechanics
- **Conditional Choices**: Special choices locked behind achievements (e.g., "Requires: Detective Badge")
- **Credit-Based Choices**: Premium choices requiring credit investment for better outcomes
- **Multiple Ending Types**: Normal (standard), Special (specific path), Perfect (optimal choices)
- **Path Tracking**: Visual indicators for explored vs. unexplored choices in replays

#### Enhanced Credit System UX
- **Dynamic Cost Display**: Real-time credit costs shown on choice buttons
- **Credit Investment Strategy**: Some choices cost more but lead to better outcomes
- **Refill Visualization**: Progress bar showing time until next credit refill
- **Credit Purchase Flow**: Seamless integration with payment systems when credits run out

#### Achievement Integration UX
- **Real-Time Unlock Notifications**: Toast notifications for achievement unlocks during gameplay
- **Progress Visualization**: Progress bars showing advancement toward next achievement
- **Achievement Gates**: Visual indicators showing which achievements unlock new content
- **Avatar Collection Display**: Interactive avatar gallery with unlock conditions shown

### 2.4 Player UI — Data Requirements

#### Home/Library Screen
- **Story Cards**: Rich previews with animated thumbnails, rating badges, playtime estimates
- **Personalization**: Recommendation engine data (played stories, preferences, achievements)
- **Featured Content**: Editorial picks, trending stories, new releases
- **User Status**: Credit balance, achievement count, avatar display

#### Story Detail Screen
- **Comprehensive Metadata**: Story description, author info, genre tags, difficulty rating
- **Media Gallery**: Screenshots, video previews, character art gallery
- **Social Proof**: Rating breakdown, recent reviews, completion statistics, friend activity
- **Prerequisites**: Required achievements, credit costs, estimated completion time

#### Immersive Story Player
- **Scene Data**: Multi-segment structure (video_url, image_url, text_segments, timing_data)
- **Choice Configuration**: Choice text, costs, requirements, destination scenes, preview data
- **Progress Tracking**: Scene graph position, paths taken, time spent, credits consumed
- **Audio Assets**: Background music, sound effects, ambient audio tracks

#### Enhanced Profile Screen
- **Avatar Collection**: Interactive gallery with unlocked/locked states, preview functionality
- **Achievement Grid**: Categorized achievements (completion, exploration, social, special)
- **Story History**: Detailed playthrough data (paths taken, endings unlocked, time investment)
- **Social Integration**: Friend list, activity feed, shared achievements

## 3. ADMIN EXPERIENCE SPEC (AXS)

### 3.1 Admin Roles

#### Super Admin
- **Permissions**: Complete system control, user management, billing integration, system configuration
- **Access**: All admin panels, system settings, advanced analytics, user data export, API management
- **Responsibilities**: Platform strategy, revenue optimization, security oversight, compliance management

#### Content Director
- **Permissions**: Full content lifecycle management, team coordination, quality standards
- **Access**: Story editor, media library, team management, content analytics, publishing workflow
- **Responsibilities**: Content strategy, editorial standards, creator management, content calendar

#### Story Editor
- **Permissions**: Create/edit stories, manage scenes, integrate AI assistance, collaborate with team
- **Access**: Advanced story editor, media upload, AI tools, preview functionality, collaboration features
- **Responsibilities**: Story creation, narrative quality, technical implementation, user experience

#### Community Manager
- **Permissions**: Review moderation, user communication, social features, community analytics
- **Access**: Review moderation tools, user management (limited), social features, community reports
- **Responsibilities**: Community engagement, content moderation, user support, social features management

#### Data Analyst
- **Permissions**: Advanced analytics access, report generation, data export, business intelligence
- **Access**: Comprehensive analytics dashboard, custom report builder, data visualization tools
- **Responsibilities**: Performance analysis, user behavior insights, revenue optimization, strategic reporting

### 3.2 End-to-End Admin Workflow

#### Advanced Story Creation Workflow
1. **Template Selection**: Choose from story templates (mystery, romance, horror, adventure)
2. **AI-Assisted Planning**: Use Gemini AI to generate story outline and branching structure
3. **Visual Graph Construction**: Build story using interactive node-based editor with real-time validation
4. **Multimedia Integration**: Upload videos, images, audio with automatic optimization and CDN integration
5. **Conditional Logic Setup**: Configure achievement requirements, credit costs, special endings
6. **Collaborative Review**: Team members can comment and suggest changes in real-time
7. **Automated Quality Checks**: System validates for orphan nodes, infinite loops, unreachable endings
8. **A/B Testing Setup**: Configure alternative paths for testing different story variations
9. **Publishing Scheduling**: Set release date, promotional features, targeted user segments
10. **Performance Monitoring**: Real-time analytics on story engagement, drop-off points, completion rates

#### AI-Enhanced Content Creation
1. **Context Generation**: AI generates scene descriptions based on story context and desired tone
2. **Branching Suggestions**: AI recommends interesting story branches and plot developments
3. **Dialogue Writing**: AI assists with character dialogue and narrative text generation
4. **Quality Enhancement**: AI analyzes text for consistency, pacing, and engagement potential
5. **Translation Support**: AI assists with localization and cultural adaptation

#### Advanced Media Asset Management
1. **Multi-Format Upload**: Drag-and-drop support for images, videos, audio with batch processing
2. **AI-Powered Optimization**: Automatic compression, format conversion, quality enhancement
3. **Smart Tagging**: AI-generated tags and metadata for improved searchability
4. **Usage Analytics**: Detailed tracking of asset performance across stories
5. **Rights Management**: Copyright tracking, licensing information, usage rights validation
6. **Version Control**: Asset versioning with rollback capabilities and change tracking

#### Sophisticated Analytics & Reporting
1. **Real-Time Dashboard**: Live metrics with interactive charts using Recharts visualization
2. **User Journey Analysis**: Complete funnel analysis from discovery to completion
3. **Behavioral Heatmaps**: Visual representation of user choices and drop-off points
4. **Economic Analytics**: Credit economy analysis, revenue tracking, purchase patterns
5. **Content Performance**: Story performance comparison, genre analysis, creator effectiveness
6. **Predictive Analytics**: ML-powered predictions for user engagement and revenue

### 3.3 Admin Screen Specifications

#### Advanced Dashboard
- **Purpose**: Comprehensive platform overview with real-time metrics and predictive analytics
- **Actions Available**: Interactive charts, drill-down reports, alert configuration, team performance
- **Data Fields**: DAU/MAU, retention curves, revenue metrics, story performance, user segmentation
- **State Transitions**: Click metric → detailed analysis; Configure alerts → notification settings
- **Validation Rules**: Role-based data access, real-time data validation, GDPR compliance

#### Visual DAG Story Editor
- **Purpose**: Professional node-based story creation with advanced features
- **Actions Available**: Drag-drop nodes, auto-layout, AI suggestions, collaborative editing
- **Data Fields**: Story graph, node properties, connection validation, multimedia assets
- **State Transitions**: Drag node → reposition with snap-to-grid; Click connection → edit conditions
- **Validation Rules**: Real-time structure validation, infinite loop detection, orphan node prevention

#### AI Content Assistant
- **Purpose**: AI-powered content creation and enhancement tools
- **Actions Available**: Generate content, suggest improvements, analyze quality, auto-complete
- **Data Fields**: AI prompts, generated content, quality scores, suggestion confidence
- **State Transitions**: Type prompt → Generate options; Accept suggestion → Apply to story
- **Validation Rules**: Content quality checks, bias detection, appropriateness filtering

#### Advanced Analytics Suite
- **Purpose**: Business intelligence and user behavior analysis
- **Actions Available**: Custom reports, data export, predictive modeling, cohort analysis
- **Data Fields**: User behavior, economic metrics, content performance, engagement patterns
- **State Transitions**: Select date range → Update visualizations; Export → Download CSV/PDF
- **Validation Rules**: Data privacy controls, query performance limits, result validation

#### User Behavior Analytics
- **Purpose**: Deep analysis of user engagement and story interaction patterns
- **Actions Available**: Funnel analysis, path visualization, segmentation analysis
- **Data Fields**: Choice patterns, completion rates, time investment, credit spending
- **State Transitions**: Select user segment → Filtered analytics; Click story → Detailed performance
- **Validation Rules**: Anonymization rules, sample size validation, statistical significance

#### Content Moderation Center
- **Purpose**: Comprehensive review and moderation of user-generated content
- **Actions Available**: Review queue management, bulk actions, automated filtering, AI assistance
- **Data Fields**: Review content, user reports, moderation history, sentiment analysis
- **State Transitions**: Review item → Approve/Reject; Flag item → Escalated review
- **Validation Rules**: Content policy compliance, spam detection, harassment prevention

### 3.4 Admin-Only Data Model

#### Advanced Story Metadata
- **Performance Analytics**: Completion rates by user segment, drop-off heatmaps, choice distribution
- **Economic Data**: Revenue per story, credit consumption patterns, conversion rates
- **A/B Testing Results**: Variant performance, statistical significance, user preference data
- **Content Quality Scores**: AI-generated quality ratings, user engagement correlation
- **Collaboration History**: Edit timestamps, contributor actions, comment threads
- **SEO & Discovery**: Search performance, recommendation effectiveness, traffic sources

#### User Analytics & Behavior
- **Detailed Journey Mapping**: Scene-by-scene progression, timing patterns, choice hesitation
- **Economic Behavior**: Credit spending velocity, purchase patterns, price sensitivity
- **Social Engagement**: Sharing patterns, friend influence, community participation metrics
- **Device & Platform**: Performance by device, browser compatibility, connection quality impact
- **Retention Analysis**: Cohort retention, churn prediction, re-engagement effectiveness
- **Predictive Modeling**: Lifetime value prediction, churn risk scoring, engagement forecasting

#### System Configuration & Feature Flags
- **AI Model Configuration**: Gemini API settings, model parameters, prompt templates
- **Credit Economy Tuning**: Refill rates, cost algorithms, bonus structures, purchase pricing
- **Content Recommendation**: Algorithm weights, personalization factors, diversity controls
- **Performance Optimization**: CDN settings, caching strategies, compression levels
- **Security Settings**: Rate limiting, authentication methods, data encryption parameters
- **Compliance Configuration**: GDPR settings, data retention policies, privacy controls

#### Advanced Content Management
- **Workflow Automation**: Automated quality checks, approval routing, scheduling systems
- **Collaboration Tools**: Real-time editing, change tracking, comment threading, version control
- **Content Personalization**: Dynamic content based on user preferences, achievement-based branching
- **Monetization Features**: Premium content gates, subscription integration, advertising controls
- **Internationalization**: Multi-language support, cultural adaptation, regional content optimization
- **Backup & Disaster Recovery**: Automated backups, version snapshots, rollback capabilities, redundancy systems