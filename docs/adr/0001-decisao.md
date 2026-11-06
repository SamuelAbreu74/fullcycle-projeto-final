# ADR 0001: API única com SQLite e Repository

- **Status:** Aceita
- **Data:** 06-11-2026

## Contexto

O Projeto B pede um fluxo de domínio ponta a ponta e requisitos de qualidade, operação e documentação, mantendo o escopo simples. O sistema precisa registrar despesas e consultar os lançamentos de um mês sem exigir infraestrutura externa para desenvolvimento e execução local.

## Decisão

Implementar uma API única em Node.js/TypeScript com Fastify e SQLite. Manter domínio, aplicação, infraestrutura e HTTP como camadas dentro do mesmo processo. A aplicação acessa persistência por uma interface `ExpenseRepository`, implementada por `SqliteExpenseRepository`.

O **Repository** foi escolhido para separar os casos de uso do mecanismo de armazenamento e permitir testes unitários com um repositório em memória. A implementação SQLite é usada no teste de integração e na execução real.

## Alternativas consideradas

- **PostgreSQL:** apropriado para maior concorrência, operação distribuída e requisitos avançados de persistência. Requer um serviço adicional e aumenta a configuração sem benefício necessário neste escopo.
- **Acesso SQL direto nos handlers:** tem menos abstração inicial, mas mistura HTTP, persistência e fluxo de aplicação, tornando regras e testes mais acoplados.
- **Microsserviços ou módulos implantáveis independentes:** desnecessários para um domínio e um único fluxo, aumentando custo operacional sem atender a uma necessidade demonstrada.

## Consequências

- A aplicação e o banco local sobem sem serviço de banco separado.
- O volume do Compose preserva os dados entre reinicializações dos contêineres.
- O repositório é uma abstração pequena; não há infraestrutura genérica nem múltiplas implementações de produção.
- SQLite atende ao objetivo didático e ao escopo reduzido, mas não é uma escolha automática para cargas concorrentes maiores ou implantação distribuída.
