
export interface Story {
  id: string;
  title: string;
  description: string;
  genre: string;
  coverImage: string;
  rating: number;
  duration: string;
  totalEndings: number;
  totalPlayers: number;
  tags: string[];
  isNew?: boolean;
  isPopular?: boolean;
  comingSoon?: boolean;
  launchDate?: string;
  
  // Media
  trailerUrl?: string; // YouTube URL
  gallery?: string[]; // Array of image URLs
}

export interface StorySegment {
  id?: string;
  text: string;
  image?: string; // Optional override for the main cover image
  videoSrc?: string;
  duration?: number; // Optional duration override in ms
}

export interface StoryNode {
  id: string;
  segments: StorySegment[];
  choices: Choice[];
  bgMusic?: string; // URL for background music specific to this node
}

export interface Choice {
  id: string;
  text: string;
  nextNodeId: string;
  requiredAchievement?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  achievements: string[];
  playedStories: string[];
  endingsUnlocked: number;
  favorites: string[];
  isGuest?: boolean;
  
  // Credit System
  credits: number;
  maxCredits: number;
  lastRefillTime: number; // Timestamp in ms
  ratedStoriesForBonus: string[]; // Track which stories already gave the bonus
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  adminReply?: {
    text: string;
    date: string;
  };
}

export enum GameState {
  IDLE,
  PLAYING,
  CHOICE,
  ENDED
}
