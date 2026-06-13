---
description: Busca de regras e workflows aplicaveis no repositorio
---

# Search Rules

Use este workflow para localizar rapidamente regras de desenvolvimento, checklists e runbooks antes de implementar ou revisar uma mudanca.

## 1. Identifique o contexto

Classifique a tarefa por area:

- Backend: API, dominio, persistencia, jobs, filas, seguranca server-side.
- Frontend: rotas, componentes, estado, formularios, UI, performance web.
- Mobile: telas, navegacao, permissoes, estado, build nativo.
- Banco: migrations, indices, queries, modelagem, backup.
- Transversal: commits, releases, seguranca, revisao, build, lint, testes.

## 2. Liste arquivos disponiveis

```bash
find .windsurf/rules .windsurf/workflows -type f -name '*.md' | sort
```

## 3. Busque por palavra-chave

Use `rg` por ser rapido e preservar linha/arquivo:

```bash
rg -n "termo" .windsurf/rules .windsurf/workflows
```

Exemplos:

```bash
rg -n "commit|Conventional" .windsurf/rules .windsurf/workflows
rg -n "migration|Flyway|Liquibase" .windsurf/rules .windsurf/workflows
rg -n "tenant|autorizacao|BOLA|IDOR" .windsurf/rules .windsurf/workflows
rg -n "typecheck|TypeScript|any|unknown" .windsurf/rules .windsurf/workflows
rg -n "PostgreSQL|indice|constraint|TIMESTAMPTZ" .windsurf/rules .windsurf/workflows
```

## 4. Leia o arquivo relevante

Depois de encontrar o arquivo, leia a secao completa antes de aplicar a regra:

```bash
sed -n '1,220p' .windsurf/rules/<arquivo>.md
sed -n '1,220p' .windsurf/workflows/<arquivo>.md
```

## 5. Aplique sem duplicar

- Use a regra encontrada como fonte de verdade.
- Se a regra estiver incompleta, proponha atualizar o arquivo central.
- Nao replique a mesma regra em stubs de ferramentas diferentes.
- Ao criar nova regra, use frontmatter obrigatorio:

```yaml
---
trigger: always_on | model_decision
description: ...
globs:
---
```

## Workflows Relacionados

- `/build`
- `/lint`
- `/test`
- `/typecheck`
- `/migration`
- `/pre-commit-backend`
- `/pre-commit-frontend`
- `/pre-commit-mobile`
- `/commit`
- `/review`

