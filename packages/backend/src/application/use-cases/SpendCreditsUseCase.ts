import { CreditTransaction } from '@talepick/shared';
import { CreditService } from '../../domain/services/CreditService';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ICreditRepository } from '../../domain/repositories/ICreditRepository';

export class SpendCreditsUseCase {
  constructor(
    private userRepository: IUserRepository,
    private creditRepository: ICreditRepository
  ) {}

  async execute(
    userId: string,
    amount: number,
    source: string,
    metadata?: Record<string, unknown>
  ): Promise<CreditTransaction> {
    // Get current user and balance
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const currentBalance = await this.creditRepository.getUserBalance(userId);

    // Validate transaction using domain service
    const validation = CreditService.validateCreditTransaction(currentBalance, amount, 'spend');

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Calculate new balance
    const newBalance = currentBalance - amount;

    // Update balance atomically
    await this.creditRepository.updateBalance(userId, newBalance);

    // Record transaction
    const transaction: CreditTransaction = {
      id: this.generateTransactionId(),
      userId,
      transactionType: 'spend',
      source,
      amount,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      metadata,
      createdAt: new Date(),
    };

    await this.creditRepository.recordTransaction(transaction);

    return transaction;
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
