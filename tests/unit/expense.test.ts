import { describe, expect, it } from 'vitest';
import {
  createExpense,
  DomainValidationError,
  isValidMonth,
  type ExpenseInput,
} from '../../src/domain/expense.js';

const validInput: ExpenseInput = {
  amountCents: 1234,
  description: '  Lunch  ',
  occurredOn: '2026-11-06',
};

describe('createExpense', () => {
  it('creates an expense with a trimmed description', () => {
    expect(createExpense('expense-1', validInput)).toEqual({
      id: 'expense-1',
      amountCents: 1234,
      description: 'Lunch',
      occurredOn: '2026-11-06',
    });
  });

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid amount %s',
    (amountCents) => {
      expect(() =>
        createExpense('expense-1', { ...validInput, amountCents }),
      ).toThrow(DomainValidationError);
    },
  );

  it.each(['', '   ', 'x'.repeat(201)])(
    'rejects invalid description of length %i',
    (description) => {
      expect(() =>
        createExpense('expense-1', { ...validInput, description }),
      ).toThrow(DomainValidationError);
    },
  );

  it.each(['2026-02-29', '2026-13-01', '2026-2-01', '0000-01-01'])(
    'rejects invalid date %s',
    (occurredOn) => {
      expect(() =>
        createExpense('expense-1', { ...validInput, occurredOn }),
      ).toThrow(DomainValidationError);
    },
  );

  it('accepts a leap-day date', () => {
    expect(
      createExpense('expense-1', { ...validInput, occurredOn: '2024-02-29' }).occurredOn,
    ).toBe('2024-02-29');
  });
});

describe('isValidMonth', () => {
  it('accepts a valid month', () => {
    expect(isValidMonth('2026-11')).toBe(true);
  });

  it.each(['2026-00', '2026-13', '26-11', '0000-01'])(
    'rejects invalid month %s',
    (month) => {
      expect(isValidMonth(month)).toBe(false);
    },
  );
});
