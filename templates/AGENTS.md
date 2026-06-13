# Agent Instructions ([Nome do Projeto])

Instrucoes base para todos os agentes de IA que trabalham neste repositorio. Este arquivo deve ser a fonte operacional compartilhada entre ferramentas como Codex, Claude Code, Cursor, Windsurf, Copilot e equivalentes.

## Idioma

- Responda sempre em portugues brasileiro.
- Commits, PRs, comentarios de review, release notes e documentacao operacional tambem devem ficar em pt-BR, salvo quando o projeto exigir outro idioma.
- Preserve nomes tecnicos, rotas, env vars, tipos, DTOs, comandos e mensagens de erro exatamente como aparecem no codigo.

## Estrutura do Repositorio

Atualize esta secao para o projeto destino:

- `backend/`: API, regras de dominio, persistencia, migrations e integracoes server-side.
- `frontend/`: aplicacao web, componentes, rotas, estado remoto, formularios e assets.
- `mobile/`: aplicacao mobile, navegacao, telas, estado remoto, formularios e configuracoes nativas.
- `docs/`: documentacao tecnica, runbooks, decisoes arquiteturais e contexto de produto.
- `.windsurf/rules/`: fonte de verdade das regras de desenvolvimento.
- `.windsurf/workflows/`: runbooks procedurais para validacao, commits, migrations, releases e revisoes.

Remova as pastas que nao existem no projeto e adicione os modulos reais relevantes.

## Fonte de Verdade das Regras

- Regras granulares ficam em `.windsurf/rules/*.md`.
- Workflows procedurais ficam em `.windsurf/workflows/*.md`.
- Ao mudar uma regra, edite a regra central. Nao duplique a mesma politica em varios arquivos.
- Stubs de outras ferramentas devem apontar para este arquivo e para `.windsurf/rules/`.

Regras transversais recomendadas:

- `.windsurf/rules/commit.md`
- `.windsurf/rules/release.md`
- `.windsurf/rules/security-core.md`
- `.windsurf/rules/security-analysis.md`
- `.windsurf/rules/postgresql.md`, `.windsurf/rules/mysql.md` ou `.windsurf/rules/mongodb.md`, conforme o banco usado.

## Comandos Canonicos

Execute comandos sempre dentro da pasta do app afetado. Ajuste esta lista ao package manager e ao build tool reais do projeto.

### Backend

```bash
# Java / Gradle
./gradlew compileJava
./gradlew checkstyleMain
./gradlew test
./gradlew build
```

```bash
# Go
go test ./...
go build ./...
gofmt -w .
```

```bash
# Node.js / NestJS
pnpm lint
pnpm test
pnpm build
```

```bash
# Python
ruff check .
python -m compileall .
pytest
```

### Frontend

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### Mobile

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Validacao Antes de Finalizar

- Rode pelo menos o validador da area alterada antes de declarar a tarefa pronta.
- Backend: compile/lint/test conforme risco da mudanca.
- Frontend: lint e typecheck sao o minimo para alteracoes TypeScript.
- Mobile: lint e typecheck sao o minimo para alteracoes TypeScript.
- Database: valide migrations contra o banco ou ambiente local apropriado quando a mudanca afetar schema.
- Se uma validacao nao puder ser executada, informe o motivo e o risco residual.

## Guardrails de Execucao

- Nao faca `git commit`, `git push`, merge, rebase, amend, force-push, reset destrutivo ou limpeza de arquivos sem pedido explicito.
- Nao reverta edicoes de outras pessoas. Se o worktree tiver mudancas alheias, trabalhe ao redor delas.
- Nao inicie servidores, containers ou servicos locais sem necessidade clara ou autorizacao do usuario.
- Nao rode testes ou builds sabidamente lentos sem alinhar quando a tarefa nao exigir essa validacao.
- Nao crie arquivos de documentacao avulsos sem necessidade; prefira atualizar a fonte de verdade existente.
- Nunca adicione `Co-authored-by:` em commits quando a regra do projeto proibir coautoria.

## Backend

- Controllers devem retornar DTOs, nao entidades de persistencia.
- Valide entradas no boundary da API com DTOs, schemas ou validators da stack.
- Aplique autorizacao no servidor; protecao apenas na UI nao e suficiente.
- Use transacoes na camada de service, nao em controllers.
- Evite N+1, queries sem paginacao e carregamento excessivo.
- Nunca concatene SQL/NoSQL com entrada externa; use queries parametrizadas ou APIs do ORM.
- Preserve isolamento de tenant, organizacao, usuario ou escopo equivalente em toda query e endpoint.

## Frontend

- Preserve o padrao do framework do projeto antes de introduzir nova abstracao.
- Use schemas compartilhados ou validacao explicita para dados vindos da API.
- Centralize chamadas HTTP em services/hooks e trate loading, erro e estado vazio.
- Evite `any`; use `unknown`, tipos especificos ou inferencia de schemas.
- Nunca exponha secrets no bundle. Variaveis publicas devem seguir o prefixo exigido pela stack.
- Garanta acessibilidade basica em controles, formularios, modais e navegacao por teclado.

## Mobile

- Preserve convencoes da stack mobile do projeto, incluindo navegacao, tema e componentes base.
- Sincronize DTOs e schemas com o backend quando houver contratos compartilhados.
- Trate estados offline, loading, erro e retry nos fluxos que dependem de rede.
- Nao assuma permissoes nativas concedidas; trate negacao e indisponibilidade.
- Valide em simulador/emulador ou dispositivo quando a mudanca afetar UI nativa, build nativo ou permissao.

## Migrations e Banco de Dados

- Migrations aplicadas sao imutaveis. Para corrigir schema, crie uma nova migration.
- Uma migration deve representar uma mudanca logica clara.
- Nomeie tabelas, colunas, indices e constraints de forma descritiva.
- Inclua indices para foreign keys e consultas frequentes.
- Evite mudancas destrutivas sem plano de compatibilidade, backfill e rollback.
- Separe mudancas que o banco nao permite na mesma transacao, como certos usos de enums, indices concorrentes ou DDL especifico da engine.

## Commits e Release

- Use Conventional Commits em pt-BR: `<tipo>(escopo opcional): <descricao curta>`.
- Mantenha uma mudanca logica por commit.
- Separe commits por area quando backend, frontend, mobile, infra e docs forem independentes.
- Nao publique release, tag ou push sem pedido explicito.
- Quando houver release, siga `.windsurf/rules/release.md` e registre notas claras para usuarios e suporte.

## Politica de Contexto

- Leia primeiro os arquivos diretamente relacionados ao modulo alterado.
- Use busca textual (`rg`) antes de assumir padroes.
- Consulte `.windsurf/rules/` quando houver duvida de convencao.
- Evite carregar contexto amplo sem necessidade; amplie a investigacao quando a primeira hipotese falhar ou quando o usuario pedir revisao completa.

