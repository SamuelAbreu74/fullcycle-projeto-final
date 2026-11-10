# Desempenho e SLO

## SLO proposto

**Objetivo:** p95 do tempo de resposta HTTP abaixo de 500 ms no smoke test definido neste documento. A meta aplica-se ao ambiente, duração e carga informados abaixo; não é uma promessa de desempenho em produção.

## Smoke test

O script `k6/smoke.js` executa por 30 segundos com uma VU. Cada iteração cria uma despesa e consulta o mês correspondente. O p95 é calculado pelo k6 sobre os tempos de resposta HTTP observados. O teste também exige que as verificações de criação e consulta tenham sucesso.

Com a API em execução, o k6 pode ser executado localmente:

```sh
k6 run k6/smoke.js
```

Ou em um contêiner Docker, no Linux:

```sh
docker run --rm --network host -v "$PWD:/work:ro" -w /work grafana/k6 run k6/smoke.js
```

## Resultados medidos

### Execução local sem Docker

**Data:** 06-11-2026  
**k6:** 2.3.0  
**Ambiente:** Linux 7.0.0-42-generic, Node.js 24.13.1; API compilada e executada localmente, com SQLite em arquivo temporário. O Docker não foi usado porque o daemon não estava disponível.

| Medida | Resultado | Objetivo |
|---|---:|---:|
| Duração e carga | 30 s, 1 VU | Smoke test |
| Iterações | 30 | — |
| Requisições HTTP | 60 (30 `POST` e 30 `GET`) | — |
| Verificações aprovadas | 60/60 (100%) | > 99% |
| Requisições com falha | 0/60 (0%) | — |
| Latência p95 | 15 ms | < 500 ms |
| Latência média | 6 ms | — |
| Latência máxima | 32.04 ms | — |

O k6 reportou ambos os thresholds aprovados. A métrica `/metrics` também foi consultada após o teste e mostrou 30 criações (`201`) e 30 consultas mensais (`200`).

### Execução com k6 em contêiner Docker

**Data:** 10-11-2026
**Imagem do k6:** `grafana/k6:latest`
**Ambiente:** Linux; script e API executados conforme o comando Docker acima, usando `--network host`.

| Medida | Resultado | Objetivo |
|---|---:|---:|
| Duração e carga | 30 s, 1 VU | Smoke test |
| Iterações | 30 | — |
| Requisições HTTP | 60 (30 `POST` e 30 `GET`) | — |
| Verificações aprovadas | 60/60 (100%) | > 99% |
| Requisições com falha | 0/60 (0%) | — |
| Latência p95 | 5.86 ms | < 500 ms |
| Latência média | 2.98 ms | — |
| Latência mediana | 2.83 ms | — |
| Latência p90 | 5.5 ms | — |
| Latência máxima | 10.51 ms | — |
| Menor latência | 384.82 µs | — |

O k6 reportou ambos os thresholds aprovados. Não houve requisições com falha.

## Limitações

As medições caracterizam execuções de smoke test com uma VU e 30 segundos, não testes de carga ou garantias de desempenho em produção. A segunda execução usou a tag flutuante `latest`; a versão exata do k6 não foi registrada. Resultados podem variar conforme hardware, carga e ambiente. `--network host` foi usado no Linux; Docker Desktop pode exigir outra configuração de rede.
