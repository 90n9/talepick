import { CreditTransaction } from '@talepick/shared';

export interface ICreditRepository {
  getUserBalance(userId: string): Promise<number>;
  updateBalance(userId: string, newBalance: number): Promise<void>;
  recordTransaction(transaction: CreditTransaction): Promise<void>;
  getTransactionHistory(userId: string, limit?: number): Promise<CreditTransaction[]>;
  getTotalEarned(userId: string, startDate?: Date, endDate?: Date): Promise<number>;
  getTotalSpent(userId: string, startDate?: Date, endDate?: Date): Promise<number>;
}
