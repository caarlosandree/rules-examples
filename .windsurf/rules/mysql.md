---
trigger: model_decision
description: Regras e padrões para desenvolvimento com MySQL/MariaDB. Use esta regra quando criar schemas, escrever queries SQL, otimizar performance, gerenciar migrations com Flyway/Liquibase, configurar roles e permissões, ou definir estratégias de replicação e backup. Cobre nomenclatura, tipos de dados, índices, EXPLAIN, paginação, transactions/locks, migrations, roles, replicação e backup.
globs: **/*.sql
---
# Regras de Desenvolvimento - MySQL/MariaDB

## Stack Tecnológica

- **MySQL 8.0+** ou **MariaDB 10.6+** como banco de dados relacional
- **InnoDB** como engine padrão (obrigatório para transações e foreign keys)
- **Flyway** ou **Liquibase** para migrations e versionamento de schema
- **MySQL Enterprise Monitor**, **Percona Monitoring and Management (PMM)** ou **Prometheus + mysqld_exporter** para monitoramento
- **MySQL Router** ou **ProxySQL** para balanceamento de leituras (quando necessário)

## Princípios Gerais

- Escreva SQL claro e legível; priorize clareza sobre concisão quando necessário.
- Use nomes descritivos para tabelas, colunas, índices, constraints e stored procedures.
- Documente decisões complexas com comentários (`COMMENT`).
- Mantenha migrations pequenas, atômicas e versionadas.
- Siga o princípio do menor privilégio em usuários e roles.

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

### Stored Procedures, Functions, Views e Triggers

- Stored procedures: **snake_case**, verbos descritivos (ex: `process_payment`)
- Functions: **snake_case**, verbos descritivos (ex: `calculate_discount`)
- Triggers: `trg_{table}_{event}` (ex: `trg_users_before_insert`)
- Views: **snake_case**, descritivas (ex: `user_summary`)

### Exemplos de Nomes

- ✅ Bom: `user_profiles`, `order_items`, `created_at`, `is_active`, `idx_orders_user_id_created_at`
- ❌ Ruim: `tbl1`, `col1`, `flag`, `x`, `data`, `temp`, `idx_temp`

## Design de Schema e Normalização

- Normalize até pelo menos a 3NF.
- Evite redundância de dados.
- Use foreign keys para manter integridade referencial.
- Use engine **InnoDB** em todas as tabelas.

```sql
-- ✅ Bom: Schema normalizado com InnoDB
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_users FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ❌ Ruim: Engine MyISAM e dados redundantes
CREATE TABLE orders_bad (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL
) ENGINE=MyISAM;
```

## Tipos de Dados

- Use `BIGINT UNSIGNED AUTO_INCREMENT` para IDs.
- Use `DECIMAL` para valores monetários (nunca `FLOAT` ou `DOUBLE`).
- Use `TIMESTAMP` ou `DATETIME` para timestamps; prefira `TIMESTAMP` quando o range for suficiente.
- Use `VARCHAR(n)` com limite real; use `TEXT` para strings longas.
- Use `BINARY(16)` ou `CHAR(36)` para UUIDs.
- Use `JSON` para dados semi-estruturados (MySQL 5.7+).

```sql
-- ✅ Bom: Tipos apropriados
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    tags JSON,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ❌ Ruim: Tipos inadequados
CREATE TABLE products_bad (
    id INT PRIMARY KEY,
    price FLOAT,
    created_at VARCHAR(20),
    description VARCHAR(255)
) ENGINE=InnoDB;
```

## Constraints e Validação

- Sempre defina primary keys.
- Use `NOT NULL` para campos obrigatórios.
- Use `UNIQUE` para valores únicos.
- Use `CHECK` para validações de domínio (MySQL 8.0.16+; MariaDB 10.2.1+).
- Defina foreign keys com `ON DELETE` e `ON UPDATE` adequados.

```sql
-- ✅ Bom: Constraints adequadas
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INT CHECK (age >= 0 AND age <= 150),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT ck_users_status CHECK (status IN ('active', 'inactive', 'suspended'))
) ENGINE=InnoDB;
```

## Índices

- Sempre crie índices em foreign keys.
- Crie índices em colunas frequentemente usadas em `WHERE`, `JOIN` e `ORDER BY`.
- Use índices compostos para queries com múltiplas condições.
- Use índices parciais via índices funcionais (MySQL 8.0.13+) quando apropriado.
- Evite índices desnecessários que degradam writes.

```sql
-- ✅ Bom: Índices adequados
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id_created_at ON orders(user_id, created_at DESC);
CREATE UNIQUE INDEX uk_users_email ON users(email);

-- ❌ Ruim: Índice desnecessário
CREATE INDEX idx_users_name ON users(name); -- name nunca usado em WHERE/JOIN
```

## Queries Otimizadas e EXPLAIN

- Sempre use `EXPLAIN` ou `EXPLAIN ANALYZE` antes de otimizar queries.
- Prefira `SELECT` específico em vez de `SELECT *`.
- Evite funções em colunas de `WHERE` quando precisar de índice.
- Use `EXISTS` ao invés de `IN` para subqueries correlacionadas.

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

- Verifique `type` (busque `ref`, `eq_ref`, `range`, `const`; evite `ALL`).
- Verifique `key` para confirmar uso de índice.
- Verifique `Extra` (evite `Using filesort` e `Using temporary` quando possível).

```sql
-- ✅ Bom: Análise detalhada
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 123 ORDER BY created_at DESC LIMIT 20;
```

## Paginação

- Use `LIMIT`/`OFFSET` para paginação simples com offsets pequenos.
- Para grandes datasets, use cursor-based pagination.

```sql
-- ✅ Bom: Paginação simples
SELECT id, name, email
FROM users
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- ✅ Bom: Cursor-based pagination
SELECT id, name, email
FROM users
WHERE id > :last_id
ORDER BY id
LIMIT 20;
```

## Transactions e Locks

- Use transactions para garantir consistência.
- Mantenha transações curtas para evitar deadlocks.
- Escolha o isolation level adequado.
- Use `SELECT ... FOR UPDATE` com cautela.

```sql
-- ✅ Bom: Transação curta e consistente
START TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;

-- ❌ Ruim: Transação longa com lógica desnecessária
START TRANSACTION;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
-- ... lógica de negócio demorada ...
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;
```

### Níveis de Isolamento

- `READ COMMITTED`: padrão recomendado para a maioria dos cenários.
- `REPEATABLE READ`: use quando necessário (padrão no MySQL).
- `SERIALIZABLE`: apenas quando estritamente necessário.

```sql
-- ✅ Bom: Configurar isolation level por sessão
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

## Migrations

- Use migrations versionadas com Flyway ou Liquibase.
- Nunca modifique migrations já aplicadas em produção.
- Mantenha migrations pequenas e atômicas.
- Antes de aplicar em produção, valide lock, tempo estimado, plano de rollback e impacto em réplicas.
- Para tabelas grandes, prefira expand/contract: adicionar estrutura compatível, backfill em lotes, alternar aplicação e remover legado depois.
- Use DDL online quando suportado (`ALGORITHM=INPLACE` ou `ALGORITHM=INSTANT`, `LOCK=NONE`) e valide no ambiente alvo.
- Para alterações pesadas, considere `gh-ost` ou `pt-online-schema-change`.
- Separe schema migration de backfill volumoso; backfills devem ser idempotentes e observáveis.

```sql
-- ✅ Bom: Migration estruturada
-- V1__Create_users_table.sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB;

CREATE INDEX idx_users_email ON users(email);

-- Comentários
ALTER TABLE users COMMENT = 'Tabela de usuários do sistema';
ALTER TABLE users MODIFY COLUMN email VARCHAR(255) COMMENT 'Email único do usuário';
```

### Migrations Destrutivas

- Faça backup antes de migrations destrutivas.
- Use abordagem em múltiplas etapas.
- Nunca remova coluna/tabela no mesmo deploy que deixa de usá-la; aguarde confirmação de rollout e métricas.
- Migrations destrutivas devem ter owner, janela, rollback documentado e validação pós-deploy.

```sql
-- ✅ Bom: Migration segura em etapas
-- V10__Add_new_email_column.sql
ALTER TABLE users
  ADD COLUMN new_email VARCHAR(255),
  ALGORITHM=INPLACE,
  LOCK=NONE;

-- V11__Create_users_new_email_index.sql
CREATE INDEX idx_users_new_email ON users(new_email);

-- V12__Migrate_emails.sql
-- Execute em lotes pela aplicação/job para evitar locks longos e lag de réplica.
UPDATE users
SET new_email = email
WHERE id >= :batch_start
  AND id < :batch_end
  AND new_email IS NULL;

-- V13__Remove_old_email.sql (após validação)
-- ALTER TABLE users DROP COLUMN email;
```

## Roles e Segurança

- Use roles para gerenciar permissões.
- Crie usuários específicos para aplicação, leitura e migrations.
- Siga o princípio do menor privilégio.
- Evite usuário `root` ou wildcard host (`'%'`) no runtime.
- Separe usuários de app, leitura, migration, backup e replicação.
- Evite exemplos com senha real. Use placeholders não executáveis e injete secrets pelo provedor de runtime.

```sql
-- ✅ Bom: Usuários e roles
CREATE ROLE 'app_readonly';
CREATE ROLE 'app_readwrite';
CREATE ROLE 'app_migrator';
CREATE ROLE 'app_backup';
CREATE ROLE 'app_replicator';

GRANT SELECT ON mydb.* TO 'app_readonly';
GRANT SELECT, INSERT, UPDATE, DELETE ON mydb.* TO 'app_readwrite';
GRANT CREATE, ALTER, DROP, INDEX, REFERENCES, TRIGGER ON mydb.* TO 'app_migrator';
GRANT SELECT, SHOW VIEW, TRIGGER, LOCK TABLES ON mydb.* TO 'app_backup';
GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'app_replicator';

CREATE USER 'app_user'@'10.%' ACCOUNT LOCK;
CREATE USER 'migrator_user'@'10.%' ACCOUNT LOCK;
CREATE USER 'backup_user'@'10.%' ACCOUNT LOCK;
CREATE USER 'replica_user'@'10.%' ACCOUNT LOCK;

-- Defina senhas via secret manager/IaC, nunca como literal no arquivo.
-- Exemplo operacional fora do repo: ALTER USER 'app_user'@'10.%' IDENTIFIED BY valor_do_secret ACCOUNT UNLOCK;

GRANT 'app_readwrite' TO 'app_user'@'10.%';
GRANT 'app_migrator' TO 'migrator_user'@'10.%';
GRANT 'app_backup' TO 'backup_user'@'10.%';
GRANT 'app_replicator' TO 'replica_user'@'10.%';
SET DEFAULT ROLE 'app_readwrite' TO 'app_user'@'10.%';
SET DEFAULT ROLE 'app_migrator' TO 'migrator_user'@'10.%';
SET DEFAULT ROLE 'app_backup' TO 'backup_user'@'10.%';
```

### Proteção contra SQL Injection

- Use prepared statements com placeholders `?` ou parâmetros nomeados.
- Nunca concatene strings na query.

```sql
-- ✅ Bom: Prepared statement
-- SELECT * FROM users WHERE email = ?

-- ❌ Perigoso: SQL Injection
-- SELECT * FROM users WHERE email = '" + email + "'
```

## Replicação

- Use replicação assíncrona para read replicas.
- Use **GTID** para facilitar failover.
- Monitore lag de replicação.
- Separe leituras pesadas em replicas.

```ini
# ✅ Bom: Configuração de replicação no my.cnf (primary)
[mysqld]
server_id = 1
log_bin = mysql-bin
binlog_format = ROW
gtid_mode = ON
enforce_gtid_consistency = ON
binlog_row_image = FULL
```

```ini
# ✅ Bom: Configuração de replicação no my.cnf (replica)
[mysqld]
server_id = 2
relay_log = mysql-relay-bin
read_only = 1
gtid_mode = ON
enforce_gtid_consistency = ON
```

```sql
-- ✅ Bom: Iniciar replicação com GTID
CHANGE REPLICATION SOURCE TO
    SOURCE_HOST = 'primary_host',
    SOURCE_USER = 'replica_user',
    SOURCE_AUTO_POSITION = 1;

-- Configure a senha de replicação por canal seguro operacional/IaC.
-- Não versione SOURCE_PASSWORD com valor literal em migration ou runbook.

START REPLICA;

-- Verificar status
SHOW REPLICA STATUS\G
```

## Backup e Recuperação

- Configure backups automáticos regulares.
- Use `mysqldump` para backups lógicos.
- Use **Percona XtraBackup** ou **Mariabackup** para backups físicos sem bloqueio.
- Teste restauração de backups regularmente.

```bash
# ✅ Bom: Backup lógico completo
mysqldump --defaults-extra-file=/run/secrets/mysql-backup.cnf --single-transaction --routines --triggers mydb > backup_$(date +%Y%m%d).sql

# ✅ Bom: Backup apenas schema
mysqldump --defaults-extra-file=/run/secrets/mysql-backup.cnf --no-data mydb > schema_backup.sql

# ✅ Bom: Backup com XtraBackup (físico)
xtrabackup --backup --target-dir=/backup/$(date +%Y%m%d)

# ✅ Bom: Restaurar backup lógico
mysql --defaults-extra-file=/run/secrets/mysql-migrator.cnf mydb < backup_20240101.sql
```

## Monitoramento

- Monitore queries lentas via `slow_query_log`.
- Monitore locks, deadlocks e conexões ativas.
- Monitore tamanho de tabelas e índices.

```sql
-- ✅ Bom: Habilitar slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
SET GLOBAL log_output = 'FILE';

-- Ver processos ativos
SHOW PROCESSLIST;

-- Ver locks e transações
SELECT * FROM information_schema.INNODB_TRX;
SELECT * FROM performance_schema.data_locks;
```

## Checklist Antes de Commitar

- [ ] Migration testada em ambiente de desenvolvimento
- [ ] Nomenclatura consistente (snake_case)
- [ ] Engine InnoDB em todas as tabelas
- [ ] Constraints adequadas (NOT NULL, UNIQUE, CHECK, FOREIGN KEY)
- [ ] Índices em foreign keys e colunas frequentemente consultadas
- [ ] Tipos de dados apropriados
- [ ] Queries otimizadas com EXPLAIN
- [ ] Transações curtas e consistentes
- [ ] Sem dados sensíveis em texto plano
- [ ] Permissões separadas para app, leitura, migration, backup e replicação
- [ ] Migration grande usa DDL online/backfill em lotes ou ferramenta online schema change
- [ ] Backup realizado antes de migrations destrutivas
