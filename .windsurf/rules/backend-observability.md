---
trigger: model_decision
description: Regras para observabilidade backend: logs estruturados, métricas, tracing, correlação, alertas e diagnóstico sem vazamento de dados.
globs: backend/**
---

# Backend Observability

## Logs

- Use logs estruturados quando possível.
- Inclua correlation/request id em logs de request, jobs, filas e integrações.
- Não logue senha, token, secret, documento, dados de saúde, cartão, CPF completo ou payload sensível.
- Logue erro com contexto operacional suficiente: operação, entidade, tenant/cliente mascarado, status externo e tempo.

## Métricas

- Exponha latência, taxa de erro, throughput e saturação.
- Para integrações externas, meça status, timeout, retry e circuit breaker.
- Para filas/jobs, meça backlog, idade da mensagem, tentativas e dead-letter.
- Para banco, acompanhe query lenta, pool de conexões, lock e timeout.

## Tracing

- Propague trace id/correlation id entre frontend, backend, filas e serviços externos quando possível.
- Instrumente endpoints críticos, integrações, queries caras e jobs longos.

## Alertas

- Alertas devem refletir impacto: erro alto, latência alta, fila acumulando, webhook falhando, pagamento/agenda indisponível.
- Evite alertar somente por log textual quando métrica estável for possível.

## Módulos Relacionados

- `backend-core.md`: integrações, jobs e transações.
- `backend-data.md`: diagnóstico de queries e migrations.
- `security-core.md`: logs sem vazamento de dados.
