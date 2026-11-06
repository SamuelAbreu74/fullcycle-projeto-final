import { describe, expect, it } from 'vitest';
import { ExpenseService } from '../../src/application/expense-service.js';
import type { ExpenseRepository } from '../../src/application/expense-repository.js';
import type { Expense } from '../../src/domain/expense.js';

class InMemoryExpenseRepository implements ExpenseRepository {
  readonly expenses: Expense[] = [];

  save(expense: Expense): void {
    this.expenses.push(expense);
  }

  findByMonth(month: string): Expense[] {
    return this.expenses.filter((expense) => expense.occurredOn.startsWith(month));
  }
}

describe('ExpenseService', () => {
  it('saves a valid expense using an injected identifier generator', () => {
    const repository = new InMemoryExpenseRepository();
    const service = new ExpenseService(repository, () => 'expense-1');

    const result = service.create({
      amountCents: 1200,
      description: 'Lunch',
      occurredOn: '2026-11-06',
    });

    expect(result.id).toBe('expense-1');
    expect(repository.expenses).toEqual([result]);
  });

  it('lists monthly expenses and calculates their total', () => {
    const repository = new InMemoryExpenseRepository();
    repository.expenses.push(
      {
        id: 'expense-1',
        amountCents: 1200,
        description: 'Lunch',
        occurredOn: '2026-11-06',
      },
      {
        id: 'expense-2',
        amountCents: 800,
        description: 'Bus',
        occurredOn: '2026-11-07',
      },
      {
        id: 'expense-3',
        amountCents: 500,
        description: 'Book',
        occurredOn: '2026-12-01',
      },
    );
    const service = new ExpenseService(repository);

    expect(service.listByMonth('2026-11')).toEqual({
      expenses: repository.expenses.slice(0, 2),
      totalCents: 2000,
    });
  });
});
