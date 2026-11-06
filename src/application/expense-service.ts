import { randomUUID } from 'node:crypto';
import { createExpense, type Expense, type ExpenseInput } from '../domain/expense.js';
import type { ExpenseRepository } from './expense-repository.js';

export class ExpenseService {
  constructor(
    private readonly repository: ExpenseRepository,
    private readonly createId: () => string = randomUUID,
  ) {}

  create(input: ExpenseInput): Expense {
    const expense = createExpense(this.createId(), input);
    this.repository.save(expense);
    return expense;
  }

  listByMonth(month: string): { expenses: Expense[]; totalCents: number } {
    const expenses = this.repository.findByMonth(month);
    const totalCents = expenses.reduce((total, expense) => total + expense.amountCents, 0);

    return { expenses, totalCents };
  }
}
