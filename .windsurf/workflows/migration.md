---
description: Criacao e validacao de migrations de banco de dados
---

# Migration

Use este workflow quando uma tarefa alterar schema, indices, constraints, seeds estruturais, tipos de dados ou contratos persistidos.

## 1. Confirme a tecnologia

- Flyway: arquivos versionados como `V{numero}__descricao.sql`.
- Liquibase: changelog XML/YAML/JSON/SQL conforme o projeto.
- Prisma/Drizzle/TypeORM/Alembic/Django/Rails: use o gerador oficial quando ele for a fonte de verdade do projeto.
- MongoDB: use migration runner ou script versionado adotado pelo projeto.

Consulte tambem a regra do banco em `.windsurf/rules/`, como `postgresql.md`, `mysql.md` ou `mongodb.md`.

## 2. Nunca edite migration aplicada

- Se uma migration ja pode ter rodado em qualquer ambiente compartilhado, crie uma nova migration corretiva.
- Nao reordene nem renomeie migrations existentes sem plano explicito.
- Se o projeto ainda nao publicou a migration e o usuario autorizar rewrite, registre essa premissa antes de editar.

## 3. Descubra a proxima versao

### Flyway

```bash
find . -path '*/db/migration/V*__*.sql' -type f | sort -V | tail -n 20
```

Crie o proximo arquivo no diretorio de migrations do backend:

```text
V{proximo}__descricao_clara_em_snake_case.sql
```

### Liquibase

- Adicione um novo changeset com `id` unico.
- Use `author` generico do time ou padrao existente.
- Inclua rollback quando o projeto exigir.

## 4. Escreva a mudanca

- Uma migration deve representar uma mudanca logica clara.
- Use nomes descritivos para tabelas, colunas, indices e constraints.
- Crie indices para foreign keys e consultas frequentes.
- Para valores monetarios, use tipos exatos (`DECIMAL`, `NUMERIC`) em bancos relacionais.
- Para timestamps, siga o padrao do projeto; em PostgreSQL, prefira `TIMESTAMPTZ`.
- Evite DDL destrutivo sem backfill, compatibilidade entre versoes e plano de rollback.
- Separe em migrations diferentes quando a engine exigir, por exemplo enum criado e indice/constraint dependente no PostgreSQL.

## 5. Valide

Escolha a validacao real do projeto:

```bash
./gradlew test
# ou
./gradlew flywayMigrate
# ou
mvn test
# ou
pnpm prisma migrate dev
# ou
alembic upgrade head
```

Se a validacao depender de banco local, containers ou credenciais indisponiveis, informe o bloqueio e valide pelo menos nomenclatura, ordenacao e SQL estatico.

## 6. Checklist

- [ ] Migration nova, versionada e no diretorio correto.
- [ ] Nao altera migration aplicada.
- [ ] Nomes seguem a regra do banco/projeto.
- [ ] Constraints e indices necessarios foram incluidos.
- [ ] Backfill ou compatibilidade tratados quando ha dados existentes.
- [ ] Validacao executada ou bloqueio documentado.

