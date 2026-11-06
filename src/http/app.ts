import Fastify, { type FastifyInstance } from 'fastify';
import { Counter, Registry } from '@prometheus-io/client';
import { ExpenseService } from '../application/expense-service.js';
import { DomainValidationError, isValidMonth, type ExpenseInput } from '../domain/expense.js';
import type { ExpenseRepository } from '../application/expense-repository.js';

function isExpenseInput(value: unknown): value is ExpenseInput {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const input = value as Record<string, unknown>;
  return (
    typeof input.amountCents === 'number' &&
    typeof input.description === 'string' &&
    typeof input.occurredOn === 'string'
  );
}

export function buildApp(
  repository: ExpenseRepository,
  createId?: () => string,
  options: { logger?: boolean } = {},
): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? true });
  const expenses = new ExpenseService(repository, createId);
  const registry = new Registry();
  const httpRequests = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests handled by the application',
    labelNames: ['method', 'route', 'status_code'],
    registers: [registry],
  });

  app.addHook('onResponse', async (request, reply) => {
    if (request.routeOptions.url !== '/metrics') {
      httpRequests.inc({
        method: request.method,
        route: request.routeOptions.url ?? 'unmatched',
        status_code: String(reply.statusCode),
      });
    }
  });

  app.get('/health', async () => ({ status: 'ok' }));

  app.get('/metrics', async (_request, reply) =>
    reply.type(registry.contentType).send(await registry.metrics()),
  );

  app.post<{ Body: unknown }>('/expenses', async (request, reply) => {
    if (!isExpenseInput(request.body)) {
      return reply.code(400).send({ error: 'Invalid expense request body' });
    }

    try {
      const expense = expenses.create(request.body);
      return reply.code(201).send(expense);
    } catch (error) {
      if (error instanceof DomainValidationError) {
        return reply.code(400).send({ error: error.message });
      }

      throw error;
    }
  });

  app.get<{ Querystring: { month?: string } }>('/expenses', async (request, reply) => {
    const { month } = request.query;
    if (!month || !isValidMonth(month)) {
      return reply.code(400).send({ error: 'month must use YYYY-MM format' });
    }

    return { month, ...expenses.listByMonth(month) };
  });

  return app;
}
