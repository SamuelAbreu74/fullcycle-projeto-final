export interface Expense {
  id: string;
  amountCents: number;
  description: string;
  occurredOn: string;
}

export interface ExpenseInput {
  amountCents: number;
  description: string;
  occurredOn: string;
}

export class DomainValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainValidationError';
  }
}

export function createExpense(id: string, input: ExpenseInput): Expense {
  if (!Number.isSafeInteger(input.amountCents) || input.amountCents <= 0) {
    throw new DomainValidationError('amountCents must be a positive safe integer');
  }

  const description = input.description.trim();
  if (description.length === 0 || description.length > 200) {
    throw new DomainValidationError('description must contain between 1 and 200 characters');
  }

  if (!isValidDate(input.occurredOn)) {
    throw new DomainValidationError('occurredOn must be a valid date in YYYY-MM-DD format');
  }

  return {
    id,
    amountCents: input.amountCents,
    description,
    occurredOn: input.occurredOn,
  };
}

export function isValidMonth(month: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month) && !month.startsWith('0000');
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
