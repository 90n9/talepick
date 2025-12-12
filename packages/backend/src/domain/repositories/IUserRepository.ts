import { User } from '../entities/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User>;
  updateCredits(id: string, credits: number, lastCreditRefill: Date): Promise<void>;
  updateLastLogin(id: string, lastLogin: Date): Promise<void>;
  addAchievement(id: string, achievementId: string): Promise<void>;
  delete(id: string): Promise<void>;
  exists(email: string): Promise<boolean>;
}
