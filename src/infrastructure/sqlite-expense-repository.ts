import type Database from 'better-sqlite3';
import type { Expense } from '../domain/expense.js';
import type { ExpenseRepository } from '../application/expense-repository.js';

interface ExpenseRow {
  id: string;
  amount_cents: number;
  description: string;
  occurred_on: string;
}

export class SqliteExpenseRepository implements ExpenseRepository {
  constructor(private readonly database: Database.Database) {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
        description TEXT NOT NULL,
        occurred_on TEXT NOT NULL
      )
    `);
  }

  save(expense: Expense): void {
    this.database
      .prepare(`
        INSERT INTO expenses (id, amount_cents, description, occurred_on)
        VALUES (@id, @amountCents, @description, @occurredOn)
      `)
      .run(expense);
  }

  findByMonth(month: string): Expense[] {
    const rows = this.database
      .prepare(`
        SELECT id, amount_cents, description, occurred_on
        FROM expenses
        WHERE substr(occurred_on, 1, 7) = ?
        ORDER BY occurred_on, id
      `)
      .all(month) as ExpenseRow[];

    return rows.map((row) => ({
      id: row.id,
      amountCents: row.amount_cents,
      description: row.description,
      occurredOn: row.occurred_on,
    }));
  }
}
