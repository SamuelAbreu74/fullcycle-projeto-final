# Controle de despesas pessoais - Projeto Nível B

API HTTP de domínio único para registrar despesas e consultar lançamentos por mês. O projeto prioriza um fluxo pequeno, testável e executável localmente.

## Requisitos

- Docker com Docker Compose v2 para execução conteinerizada; ou
- Node.js 22.13+ e npm para desenvolvimento local.

## Executar com Docker Compose

```sh
cp .env.example .env
docker compose up --build
```

A API fica disponível em `http://localhost:3000`. O banco SQLite usa o volume nomeado `expenses-data`, preservado quando os contêineres são removidos sem a opção `-v`.

Para encerrar, use `Ctrl+C` ou execute `docker compose down`.

## Executar localmente

```sh
npm ci
npm run dev
```

A configuração padrão usa a porta `3000` e cria o banco em `data/expenses.sqlite`. É possível ajustar `PORT` e `DATABASE_PATH` no ambiente. Para desenvolvimento local, use um caminho de banco gravável pelo usuário atual.

## API

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/expenses` | Registra uma despesa |
| `GET` | `/expenses?month=AAAA-MM` | Lista despesas do mês e o total em centavos |
| `GET` | `/health` | Verifica se a API responde |
| `GET` | `/metrics` | Expõe `http_requests_total` no formato Prometheus |

Exemplo de criação:

```sh
curl -X POST http://localhost:3000/expenses \
  -H 'content-type: application/json' \
  -d '{"amountCents":1234,"description":"Almoço","occurredOn":"2026-11-06"}'
```

O valor é enviado como inteiro em centavos para evitar imprecisão de ponto flutuante. A descrição deve conter de 1 a 200 caracteres; a data deve ser válida e usar `YYYY-MM-DD`. A consulta mensal exige `month` no formato `YYYY-MM`.

A especificação completa está em [`docs/openapi.yaml`](docs/openapi.yaml).

## Arquitetura e decisões

O sistema é um monólito simples: domínio, casos de uso, persistência SQLite e camada HTTP ficam no mesmo processo. A aplicação depende de uma interface de repositório, e SQLite é sua implementação concreta. A escolha e suas alternativas estão documentadas na [ADR 0001](docs/adr/0001-decisao.md).

## Qualidade

```sh
npm run lint
npm run test:coverage
npm run build
```

Os testes unitários cobrem as regras de domínio e os casos de uso; o teste de integração executa a API com SQLite real em memória. O Vitest exige pelo menos 80% de linhas, funções e instruções e 70% de branches. O GitHub Actions executa instalação, lint, testes com cobertura e build.

## Operação e desempenho

O Fastify produz logs estruturados. A métrica `http_requests_total` é exposta em `/metrics`, com rótulos de método, rota e status HTTP. O SLO proposto e o resultado medido do smoke test estão em [`docs/desempenho.md`](docs/desempenho.md).

Com a API em execução e o k6 instalado:

```sh
k6 run k6/smoke.js
```

O teste usa uma VU por 30 segundos, exercita criação e consulta mensal e verifica um p95 inferior a 500 ms. Veja no documento de desempenho a data, o ambiente e as limitações da medição.

## Contribuições e uso de IA

As contribuições e os prompts relevantes estão registrados em [`CONTRIBUTORS.md`](CONTRIBUTORS.md) e [`docs/ia.md`](docs/ia.md).
