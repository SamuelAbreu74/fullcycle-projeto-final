import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = 'http://localhost:3000';
const occurredOn = new Date().toISOString().slice(0, 10);
const month = occurredOn.slice(0, 7);

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const created = http.post(
    `${baseUrl}/expenses`,
    JSON.stringify({
      amountCents: 500,
      description: 'k6 smoke test',
      occurredOn,
    }),
    { headers: { 'content-type': 'application/json' } },
  );
  const createdId = created.status === 201 ? created.json('id') : null;

  check(created, {
    'expense creation returns 201': (response) => response.status === 201,
  });

  const listing = http.get(`${baseUrl}/expenses?month=${month}`);
  check(listing, {
    'monthly listing contains the created expense': (response) =>
      response.status === 200 &&
      createdId !== null &&
      response.json('expenses').some((expense) => expense.id === createdId),
  });

  sleep(1);
}
