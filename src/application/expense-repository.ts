import type { Expense } from '../domain/expense.js';

export interface ExpenseRepository {
  save(expense: Expense): void;
  findByMonth(month: string): Expense[];
}
