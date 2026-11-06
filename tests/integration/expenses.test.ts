import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/http/app.js';
import { SqliteExpenseRepository } from '../../src/infrastructure/sqlite-expense-repository.js';

describe('expenses API integration', () => {
  let database: Database.Database;
  let app: FastifyInstance;

  beforeEach(() => {
    database = new Database(':memory:');
    app = buildApp(
      new SqliteExpenseRepository(database),
      () => 'expense-1',
      { logger: false },
    );
  });

  afterEach(async () => {
    await app.close();
    database.close();
  });

  it('creates an expense and returns it in the monthly listing', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/expenses',
      payload: {
        amountCents: 1234,
        description: 'Lunch',
        occurredOn: '2026-11-06',
      },
    });

    expect(created.statusCode).toBe(201);
    expect(created.json()).toEqual({
      id: 'expense-1',
      amountCents: 1234,
      description: 'Lunch',
      occurredOn: '2026-11-06',
    });

    const listing = await app.inject({
      method: 'GET',
      url: '/expenses?month=2026-11',
    });

    expect(listing.statusCode).toBe(200);
    expect(listing.json()).toEqual({
      month: '2026-11',
      expenses: [created.json()],
      totalCents: 1234,
    });
  });

  it('rejects malformed expense bodies', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/expenses',
      payload: { amountCents: 'not-a-number' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('rejects semantically invalid expense data', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/expenses',
      payload: {
        amountCents: 0,
        description: 'Lunch',
        occurredOn: '2026-11-06',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'amountCents must be a positive safe integer',
    });
  });

  it('requires a valid month for listing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/expenses?month=2026-13',
    });

    expect(response.statusCode).toBe(400);
  });

  it('exposes an HTTP request counter in Prometheus format', async () => {
    await app.inject({
      method: 'GET',
      url: '/health',
    });

    const response = await app.inject({
      method: 'GET',
      url: '/metrics',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.body).toContain(
      'http_requests_total{method="GET",route="/health",status_code="200"} 1',
    );
  });
});
