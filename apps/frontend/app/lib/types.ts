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
  trailerUrl?: string;
  gallery?: string[];
}

export interface StorySegment {
  id?: string;
  text: string;
  image?: string;
  videoSrc?: string;
  duration?: number;
}

export interface StoryNode {
  id: string;
  segments: StorySegment[];
  choices: Choice[];
  bgMusic?: string;
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
  credits: number;
  maxCredits: number;
  lastRefillTime: number;
  ratedStoriesForBonus: string[];
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
  ENDED,
}
