---
trigger: model_decision
description: Regras e padrões para desenvolvimento com PostgreSQL. Use esta regra quando criar schemas, escrever queries SQL, otimizar performance, gerenciar migrations com Flyway/Liquibase, configurar roles e permissões, ou definir estratégias de backup e monitoramento. Cobre nomenclatura, normalização, tipos de dados, índices, EXPLAIN ANALYZE, paginação, VACUUM/ANALYZE e segurança.
globs: **/*.sql
---
# Regras de Desenvolvimento - PostgreSQL

## Stack Tecnológica

- **PostgreSQL 15+** como banco de dados relacional
- **Flyway** ou **Liquibase** para migrations e versionamento de schema
- **pg_stat_statements** para análise de performance de queries
- **PostGIS** para dados geoespaciais (quando necessário)
- **pgcrypto** para criptografia de dados sensíveis
- **pgBouncer** para connection pooling (quando necessário)

## Princípios Gerais

- Escreva SQL claro e legível; priorize clareza sobre concisão quando necessário.
- Use nomes descritivos para tabelas, colunas, índices, constraints e funções.
- Documente decisões complexas com comentários SQL (`COMMENT ON`).
- Mantenha migrations pequenas, atômicas e versionadas.
- Siga o princípio do menor privilégio em roles e permissões.

## Nomenclatura

### Tabelas e Colunas

- Tabelas: **snake_case**, plural (ex: `users`, `order_items`, `user_profiles`)
- Colunas: **snake_case**, singular (ex: `user_id`, `created_at`, `email_address`)
- Chaves primárias: preferencialmente `id` ou `{table}_id`
- Chaves estrangeiras: `{referenced_table}_id` (ex: `user_id`, `order_id`)
- Timestamps: `created_at`, `updated_at`, `deleted_at`
- Booleanos: prefixo `is_`, `has_`, `can_` (ex: `is_active`, `has_permission`)

### Índices

- Índices: `idx_{table}_{columns}` (ex: `idx_users_email`, `idx_orders_user_id_created_at`)
- Índices únicos: `uk_{table}_{columns}` (ex: `uk_users_email`)
- Índices compostos: colunas ordenadas da mais específica para a menos específica

### Constraints

- Primary keys: `pk_{table}` (ex: `pk_users`)
- Foreign keys: `fk_{table}_{referenced_table}` (ex: `fk_orders_users`)
- Unique constraints: `uk_{table}_{columns}` (ex: `uk_users_email`)
- Check constraints: `ck_{table}_{description}` (ex: `ck_users_age_positive`)

### Funções, Views e Triggers

- Funções: **snake_case**, verbos descritivos (ex: `calculate_total_price`)
- Procedures: **snake_case**, verbos descritivos (ex: `process_payment`)
- Triggers: `trg_{table}_{event}` (ex: `trg_users_before_insert`)
- Views: **snake_case**, descritivas (ex: `user_summary`)
- Materialized views: prefixo `mv_` (ex: `mv_daily_sales`)

### Exemplos de Nomes

- ✅ Bom: `user_profiles`, `order_items`, `created_at`, `is_active`, `idx_orders_user_id_created_at`
- ❌ Ruim: `tbl1`, `col1`, `flag`, `x`, `data`, `temp`, `idx_temp`

## Design de Schema e Normalização

- Normalize até pelo menos a 3NF (Terceira Forma Normal).
- Evite redundância de dados.
- Use foreign keys para manter integridade referencial.
- Considere desnormalização apenas quando houver benefício mensurável de performance.

```sql
-- ✅ Bom: Schema normalizado
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ❌ Ruim: Dados redundantes
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL
);
```

## Tipos de Dados

- Use `BIGSERIAL` ou `BIGINT` para IDs.
- Use `DECIMAL` ou `NUMERIC` para valores monetários (nunca `FLOAT` ou `DOUBLE`).
- Use `TIMESTAMP WITH TIME ZONE` (`TIMESTAMPTZ`) para timestamps.
- Use `TEXT` para strings longas; `VARCHAR(n)` apenas quando houver limite real.
- Use `UUID` para identificadores distribuídos quando apropriado.
- Use `JSONB` para dados semi-estruturados (mais eficiente que `JSON`).
- Use `ARRAY` quando apropriado (ex: tags).

```sql
-- ✅ Bom: Tipos apropriados
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ❌ Ruim: Tipos inadequados
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    price FLOAT,
    created_at TIMESTAMP,
    description VARCHAR(255)
);
```

## Constraints e Validação

- Sempre use constraints para garantir integridade.
- Use `NOT NULL` para campos obrigatórios.
- Use `UNIQUE` para valores únicos.
- Use `CHECK` para validações de domínio.
- Use `DEFAULT` para valores padrão quando apropriado.
- Defina foreign keys com `ON DELETE` e `ON UPDATE` adequados.

```sql
-- ✅ Bom: Constraints adequadas
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INTEGER CHECK (age >= 0 AND age <= 150),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT ck_users_age_positive CHECK (age >= 0)
);
```

## Índices

- Sempre crie índices em foreign keys.
- Crie índices em colunas frequentemente usadas em `WHERE`, `JOIN` e `ORDER BY`.
- Use índices compostos para queries com múltiplas condições.
- Use índices parciais quando apropriado.
- Monitore uso de índices e remova índices não utilizados.

```sql
-- ✅ Bom: Índices adequados
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id_created_at ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status_created_at ON orders(status, created_at DESC)
    WHERE status = 'pending';

CREATE UNIQUE INDEX uk_users_email ON users(email);

-- ❌ Ruim: Índice desnecessário
CREATE INDEX idx_users_name ON users(name); -- name nunca usado em WHERE/JOIN
```

## Queries Otimizadas

- Sempre use `EXPLAIN ANALYZE` antes de otimizar queries.
- Prefira `SELECT` específico em vez de `SELECT *`.
- Evite funções em colunas de `WHERE` (use índices funcionais se necessário).
- Use `EXISTS` ao invés de `IN` para subqueries correlacionadas.
- Use `JOIN` ao invés de subqueries quando possível.
- Use `UNION ALL` ao invés de `UNION` quando duplicatas não importam.

```sql
-- ✅ Bom: Query otimizada
EXPLAIN ANALYZE
SELECT u.id, u.name, u.email
FROM users u
WHERE u.email = 'joao@example.com'
LIMIT 1;

-- ✅ Bom: JOIN ao invés de subquery
SELECT o.id, o.total_amount, u.name
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.email = 'joao@example.com';

-- ❌ Ruim: SELECT * e subquery desnecessária
SELECT *
FROM orders
WHERE user_id IN (
    SELECT id FROM users WHERE email = 'joao@example.com'
);
```

### EXPLAIN ANALYZE

- Use `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` para análise detalhada.
- Verifique se índices estão sendo usados (`Index Scan` vs `Seq Scan`).
- Evite `Seq Scan` em tabelas grandes sem necessidade.

```sql
-- ✅ Bom: Análise detalhada
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM orders WHERE user_id = 123 ORDER BY created_at DESC LIMIT 20;
```

## Paginação

- Use `LIMIT`/`OFFSET` para paginação simples com offsets pequenos.
- Para grandes datasets, use cursor-based pagination.

```sql
-- ✅ Bom: Paginação simples (pequenos offsets)
SELECT id, name, email
FROM users
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- ✅ Bom: Cursor-based pagination (escalável)
SELECT id, name, email
FROM users
WHERE id > :last_id
ORDER BY id
LIMIT 20;
```

## VACUUM e ANALYZE

- Execute `VACUUM ANALYZE` regularmente para recuperar espaço e atualizar estatísticas.
- Configure `autovacuum` adequadamente.
- Use `VACUUM FULL` apenas quando necessário, pois bloqueia a tabela.

```sql
-- ✅ Bom: Manutenção regular
VACUUM ANALYZE users;
VACUUM ANALYZE orders;

-- Para tabelas grandes, sem bloquear
VACUUM VERBOSE users;
```

## Migrations

- Use migrations versionadas com Flyway ou Liquibase.
- Nunca modifique migrations já aplicadas em produção.
- Crie novas migrations para alterações.
- Mantenha migrations pequenas e atômicas.
- Antes de aplicar em produção, valide tempo de lock, plano de rollback e impacto em réplicas.
- Para tabelas grandes, prefira expansão/contração: adicionar estrutura compatível, fazer backfill em lotes, alternar a aplicação e só depois remover o legado.
- Evite `ALTER TABLE` que reescreve tabela inteira em horário de pico.
- Use `lock_timeout` e `statement_timeout` em migrations que podem bloquear tráfego.
- Crie índices grandes com `CREATE INDEX CONCURRENTLY`; em Flyway, coloque essa migration fora de transação quando necessário.
- Separe migrations de schema e backfill de dados quando o volume for relevante.

```sql
-- ✅ Bom: Migration estruturada
-- V1__Create_users_table.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE INDEX idx_users_email ON users(email);

COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON COLUMN users.email IS 'Email único do usuário';
```

### Migrations Destrutivas

- Faça backup antes de migrations destrutivas.
- Use abordagem em múltiplas etapas: adicionar nova coluna, migrar dados, remover antiga.
- Nunca remova coluna/tabela no mesmo deploy que deixa de usá-la; aguarde confirmação de rollout e métricas.
- Migrations destrutivas devem ter owner, janela, rollback documentado e validação pós-deploy.

```sql
-- ✅ Bom: Migration segura em etapas
-- V10__Add_new_email_column.sql
SET lock_timeout = '5s';
SET statement_timeout = '60s';

ALTER TABLE users ADD COLUMN new_email VARCHAR(255);

-- V11__Create_users_new_email_index.sql
-- Flyway: executeInTransaction=false quando usar CONCURRENTLY.
CREATE INDEX CONCURRENTLY idx_users_new_email ON users(new_email);

-- V12__Migrate_emails.sql
-- Execute backfill em lotes pela aplicação/job para evitar lock e WAL excessivo.
UPDATE users
SET new_email = email
WHERE id >= :batch_start
  AND id < :batch_end
  AND new_email IS NULL;

-- V13__Remove_old_email.sql (após validação completa)
-- ALTER TABLE users DROP COLUMN email;
```

## Roles e Segurança

- Use roles para gerenciar permissões.
- Siga o princípio do menor privilégio.
- Crie roles específicas para contextos distintos (ex: `app_readonly`, `app_readwrite`, `migration_user`).
- Crie usuários `LOGIN` separados para aplicação, migrations, leitura e backup; não use superuser no runtime.
- Restrinja privilégios por schema e por sequência; `GRANT` em tabelas não cobre automaticamente sequences.
- Configure `ALTER DEFAULT PRIVILEGES` para novas tabelas/sequences criadas por migrations.
- Evite exemplos com senha real. Use placeholders não executáveis e injete secrets pelo provedor de runtime.

```sql
-- ✅ Bom: Roles e permissões
CREATE ROLE app_readonly NOLOGIN;
CREATE ROLE app_readwrite NOLOGIN;
CREATE ROLE app_migrator NOLOGIN;
CREATE ROLE app_backup NOLOGIN;

GRANT CONNECT ON DATABASE mydb TO app_readonly, app_readwrite, app_migrator, app_backup;
GRANT USAGE ON SCHEMA public TO app_readonly, app_readwrite, app_migrator, app_backup;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_readwrite;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO app_readwrite;

GRANT CREATE ON SCHEMA public TO app_migrator;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_backup;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO app_readonly, app_backup;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO app_readwrite;

-- Defina senhas via secret manager/IaC/psql variables, nunca como literal no arquivo.
CREATE USER app_user WITH PASSWORD :'APP_USER_PASSWORD';
CREATE USER migrator_user WITH PASSWORD :'MIGRATOR_DB_PASSWORD';
CREATE USER backup_user WITH PASSWORD :'BACKUP_DB_PASSWORD';

GRANT app_readwrite TO app_user;
GRANT app_migrator TO migrator_user;
GRANT app_backup TO backup_user;
```

### Proteção contra SQL Injection

- Nunca concatene strings para montar queries.
- Use prepared statements ou parâmetros nomeados.
- Use ORM ou query builders que protejam contra SQL injection.

```sql
-- ✅ Bom: Prepared statement (exemplo conceitual)
-- SELECT * FROM users WHERE email = ?

-- ❌ Perigoso: SQL Injection
-- SELECT * FROM users WHERE email = '" + email + "'
```

### Dados Sensíveis

- Nunca armazene senhas em texto plano; use hash no aplicativo (bcrypt, argon2).
- Use criptografia para dados sensíveis com `pgcrypto`.

```sql
-- ✅ Bom: Criptografia de dados sensíveis
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    encrypted_ssn BYTEA
);
```

## Backup e Monitoramento

### Backup

- Configure backups automáticos regulares.
- Use `pg_dump` para backups lógicos.
- Use `pg_basebackup` para backups físicos com WAL archiving.
- Teste restauração de backups regularmente.

```bash
# ✅ Bom: Backup completo
pg_dump -h "$PGHOST" -U "$PGUSER_BACKUP" -d mydb -F c -f backup_$(date +%Y%m%d).dump

# ✅ Bom: Backup apenas schema
pg_dump -h "$PGHOST" -U "$PGUSER_BACKUP" -d mydb --schema-only -f schema_backup.sql

# ✅ Bom: Restaurar backup
pg_restore -h "$PGHOST" -U "$PGUSER_MIGRATOR" -d mydb -c backup_20240101.dump
```

### Monitoramento

- Use `pg_stat_statements` para identificar queries lentas.
- Monitore `pg_stat_activity` para conexões ativas.
- Monitore tamanho de tabelas, índices, locks e deadlocks.

```sql
-- ✅ Bom: Habilitar pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Ver queries mais lentas
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Ver tamanho de tabelas
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Checklist Antes de Commitar

- [ ] Migration testada em ambiente de desenvolvimento
- [ ] Nomenclatura consistente (snake_case)
- [ ] Constraints adequadas (NOT NULL, UNIQUE, CHECK, FOREIGN KEY)
- [ ] Índices em foreign keys e colunas frequentemente consultadas
- [ ] Tipos de dados apropriados
- [ ] Queries otimizadas com EXPLAIN ANALYZE
- [ ] Sem dados sensíveis em texto plano
- [ ] Permissões configuradas com roles específicas para app, leitura, migration e backup
- [ ] Migration grande usa estratégia expand/contract, lock timeout e backfill em lotes
- [ ] Índices grandes usam `CREATE INDEX CONCURRENTLY` quando aplicável
- [ ] Backup realizado antes de migrations destrutivas
