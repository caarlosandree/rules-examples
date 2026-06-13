---
trigger: model_decision
description: Regras para acesso a dados backend: repositories, ORM, queries, transações, migrations, N+1, batch e consistência.
globs: backend/**
---

# Backend Data

## Acesso a Dados

- Isole acesso ao banco em repositories/DAOs/gateways.
- Use queries parametrizadas, query builders seguros ou ORM configurado corretamente.
- Não concatene entrada do usuário em SQL, JPQL, Mongo query, shell ou filtros dinâmicos.
- Use projeções/DTOs para consultas de leitura quando entidade completa não for necessária.
- Evite N+1 com fetch explícito, joins, entity graph, preloads ou batch loading.

## Transações e Consistência

- Leituras podem usar transações read-only quando a stack suportar.
- Escritas multi-recurso devem estar em transação.
- Use constraints únicas para proteger invariantes críticas.
- Prefira idempotência e constraints a checagens "consulta antes de inserir" vulneráveis a corrida.

## Migrations

- Migrations aplicadas em ambiente compartilhado são imutáveis.
- Crie nova migration para corrigir ou evoluir schema.
- Separe mudança de schema, backfill e troca de código quando houver tabela grande ou produção ativa.
- Planeje rollback operacional antes de aplicar migration destrutiva.

## Batch e Backfill

- Faça backfill em lotes com limite, checkpoint e possibilidade de retomar.
- Evite transações longas.
- Registre progresso e falhas sem logar PII.
- Meça impacto em locks, índices e replicação.

## Módulos Relacionados

- `postgresql.md`, `mysql.md`, `mongodb.md`: regras específicas de banco.
- `backend-core.md`: fronteiras de camada e transações.
- `backend-observability.md`: métricas e logs de queries/jobs.
