export interface Story {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
  };
  metadata: {
    genre: string;
    tags: string[];
    isPublished: boolean;
    featured: boolean;
    contentRating: {
      ageRating: number;
      violenceLevel: 'none' | 'mild' | 'moderate' | 'intense';
      sexualContent: 'none' | 'mild' | 'moderate' | 'explicit';
    };
  };
  stats: {
    totalPlayers: number;
    averageRating: number;
    totalReviews: number;
    totalEndings: number;
    estimatedPlayTime: number;
  };
  thumbnail?: string;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface StoryNode {
  id: string;
  storyId: string;
  title?: string;
  content: string;
  type: 'text' | 'choice' | 'ending';
  choices?: Choice[];
  media?: {
    type: 'image' | 'audio' | 'video';
    url: string;
    caption?: string;
  };
  metadata: {
    nodeNumber: number;
    parentNodes: string[];
    isEnding: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Choice {
  id: string;
  nodeId: string;
  text: string;
  nextNodeId?: string;
  cost?: number;
  requirements?: {
    minCredits?: number;
    achievements?: string[];
  };
  metadata?: Record<string, unknown>;
}
