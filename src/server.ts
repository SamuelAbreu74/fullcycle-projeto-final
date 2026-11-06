import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import Database from 'better-sqlite3';
import { buildApp } from './http/app.js';
import { SqliteExpenseRepository } from './infrastructure/sqlite-expense-repository.js';

const port = Number(process.env.PORT ?? '3000');
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

const databasePath = resolve(process.env.DATABASE_PATH ?? './data/expenses.sqlite');
mkdirSync(dirname(databasePath), { recursive: true });

const database = new Database(databasePath);
const repository = new SqliteExpenseRepository(database);
const app = buildApp(repository);

await app.listen({ host: '0.0.0.0', port });
