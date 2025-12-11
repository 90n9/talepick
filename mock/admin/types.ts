export enum UserType {
  GUEST = 'ผู้เยี่ยมชม',
  REGISTERED = 'สมาชิก',
  ADMIN = 'ผู้ดูแลระบบ',
}

export enum UserStatus {
  ACTIVE = 'ปกติ',
  BANNED = 'ถูกระงับ',
}

export type LoginProvider = 'email' | 'google' | 'guest';

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface UserStoryProgress {
  storyId: string;
  title: string;
  progress: number;
  status: 'กำลังเล่น' | 'จบแล้ว';
  lastPlayed: string;
}

export interface UserAchievement {
  id: string;
  title: string;
  unlockedAt: string;
}

export interface UserRating {
  storyId: string;
  title: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export type AvatarUnlockCondition =
  | 'any_ending'
  | 'specific_ending'
  | 'all_endings'
  | 'complete_100';

export interface AvatarReward {
  id: string;
  name: string;
  url: string;
  sourceStoryId?: string;
  sourceStoryTitle?: string;
  unlockCondition?: AvatarUnlockCondition;
  targetEndingId?: string; // If condition is specific_ending
}

export interface User {
  id: string;
  username: string;
  email: string | null;
  type: UserType;
  provider: LoginProvider;
  status: UserStatus;
  credits: number;
  maxCredits: number;
  storiesPlayed: number;
  achievementsUnlocked: number;
  ratingsCount: number;
  isDonator: boolean;
  lastActive: string;
  avatar: string;

  // Detailed data
  activityLogs: ActivityLog[];
  storyProgress: UserStoryProgress[];
  achievements: UserAchievement[];
  ratings: UserRating[];
  unlockedAvatars: AvatarReward[]; // New field
}

export enum StoryStatus {
  DRAFT = 'แบบร่าง',
  PUBLISHED = 'เผยแพร่แล้ว',
  ARCHIVED = 'จัดเก็บ',
}

export type GalleryItemType = 'image' | 'video';

export interface GalleryItem {
  type: GalleryItemType;
  url: string;
  thumbnail?: string; // For videos
}

// --- Asset & Moderation ---

export interface Asset {
  id: string;
  url: string;
  type: 'image' | 'audio' | 'video';
  uploadDate: string;
  size: string; // e.g. "1.2 MB"
  name?: string; // Original filename
}

export interface Story {
  id: string;
  title: string;
  description: string; // Short blurb
  fullDescription?: string; // Full plot/storyline
  genre: string;
  coverImage: string;
  headerImage: string;
  gallery?: GalleryItem[]; // Additional images/videos
  rating: number;
  duration: string;
  totalEndings: number;
  totalPlayers: number;
  tags: string[];
  isNew?: boolean;
  isPopular?: boolean;
  comingSoon?: boolean;
  launchDate?: string;

  // Rewards
  avatarRewards?: AvatarReward[];

  // Internal Game Assets (New Field)
  assets?: Asset[];

  // Admin workflow fields
  status: StoryStatus;
  scenesCount: number;
  completionRate: number;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  storyCount: number;
  isActive: boolean;
}

export interface StoryReview {
  id: string;
  storyId: string;
  storyTitle?: string;
  userId: string;
  username: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  isHidden: boolean;
  isFeatured?: boolean;
  adminReply?: string;
  adminReplyDate?: string;
}

export enum ReportStatus {
  PENDING = 'รอดำเนินการ',
  RESOLVED = 'แก้ไขแล้ว',
  DISMISSED = 'ยกเลิก/ไม่พบปัญหา',
}

export type ReportTargetType = 'story' | 'review';

export interface StoryReport {
  id: string;
  targetType: ReportTargetType; // Is this reporting the story or a specific review?
  storyId: string;
  storyTitle: string;

  // If targetType is 'review'
  reviewId?: string;
  reviewContent?: string;
  reviewOwnerName?: string;

  reporterId: string;
  reporterName: string;
  reason: string; // e.g., 'Inappropriate Content', 'Bug', 'Plagiarism'
  details: string;
  status: ReportStatus;
  timestamp: string;
}

export interface SceneChoice {
  id: string;
  text: string;
  targetSceneId: string | null;
  cost: number;
}

export interface SceneSegment {
  text: string;
  duration: number;
  image: string;
}

export interface Scene {
  id: string;
  storyId: string;
  title: string;
  bgMusic?: string;
  segments: SceneSegment[];
  choices: SceneChoice[];
  isEnding: boolean;
  endingType?: 'ปกติ' | 'พิเศษ' | 'สมบูรณ์แบบ';
  endingImage?: string;
  endingTitle?: string;
  endingDescription?: string;
  x?: number; // For graph layout
  y?: number; // For graph layout

  // Editor helper properties
  validationIssues?: string[];
  needsRevision?: boolean;
}

export interface StatMetric {
  label: string;
  value: string | number;
  change?: number; // percentage
  trend?: 'up' | 'down' | 'neutral';
}

// --- Achievement System ---

export enum AchievementType {
  AUTO = 'อัตโนมัติ',
  MANUAL = 'กำหนดเอง',
}

export enum AchievementTriggerType {
  PLAY_COUNT = 'จำนวนการเล่น',
  ENDING_COUNT = 'เก็บฉากจบ',
  STORY_COMPLETE = 'เล่นจบ 100%',
  RATING_COUNT = 'จำนวนการรีวิว',
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: AchievementType;
  icon: string; // Icon identifier (e.g. 'trophy', 'star')
  isActive: boolean;

  // Logic for Auto
  triggerType?: AchievementTriggerType;
  threshold?: number; // e.g., 5 games

  // Rewards
  rewardCredits: number;
  rewardMaxCredits: number;
  rewardAvatars?: string[]; // Changed to array of URLs

  // Analytics
  usersUnlocked: number;
  unlockTrend: number; // percentage change
}

export type ContentIssueType = 'missing_image' | 'dead_end' | 'orphan' | 'no_ending_type';

export interface ContentIssue {
  id: string;
  storyId: string;
  storyTitle: string;
  sceneId: string;
  sceneTitle: string;
  type: ContentIssueType;
  severity: 'high' | 'medium' | 'low';
}

// --- Admin Roles & Permissions ---

export enum AdminRole {
  SUPER_ADMIN = 'Super Admin',
  STORY_EDITOR = 'Story Editor',
  USER_MANAGER = 'User Manager',
  ACHIEVEMENT_MANAGER = 'Achievement Manager',
  VIEWER = 'Viewer Only',
}

export interface AdminAccount {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
  status: 'active' | 'inactive';
  lastActive: string;
  avatar: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  role: AdminRole;
  action: string;
  target: string;
  timestamp: string;
  type: 'story' | 'user' | 'system' | 'finance';
}

// --- System Settings ---

export interface CreditConfig {
  baseMaxCreditsNormal: number;
  baseMaxCreditsGuest: number;
  refillIntervalMinutes: number;
  refillAmount: number;
  ratingReward: number;
  minCreditToPlay: number;
  eventMultiplier: number;
  isEventActive: boolean;
}

export interface SystemConfig {
  siteName: string;
  maintenanceMode: boolean;
  creditConfig: CreditConfig;
}
