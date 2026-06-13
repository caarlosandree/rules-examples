# CLAUDE.md

Este arquivo complementa `AGENTS.md` com orientacoes especificas para Claude Code. As regras operacionais compartilhadas entre agentes ficam em `AGENTS.md` e em `.windsurf/rules/`.

Responda sempre em portugues brasileiro. Preserve termos tecnicos, nomes de arquivos, rotas, comandos, env vars e mensagens de erro exatamente como aparecem no projeto.

## Primeiro Passo

1. Leia `AGENTS.md`.
2. Identifique a area afetada: backend, frontend, mobile, banco, infra, docs ou raiz.
3. Consulte as regras relevantes em `.windsurf/rules/`.
4. Use os workflows de `.windsurf/workflows/` para validacao e commits quando aplicavel.

## Estrutura do Projeto

Atualize esta secao no projeto destino:

- `backend/`: [stack backend], [build tool], [banco], [framework de teste].
- `frontend/`: [framework web], TypeScript, [UI/design system], [package manager].
- `mobile/`: [framework mobile], TypeScript, [navegacao], [build tool].
- `docs/`: documentacao e runbooks.
- `.windsurf/rules/`: regras de desenvolvimento.
- `.windsurf/workflows/`: runbooks operacionais.

Remova entradas que nao existirem no projeto.

## Comandos Frequentes

Execute comandos na pasta do app afetado.

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

## Validacao Esperada

- Depois de editar TypeScript, rode lint e typecheck da area afetada.
- Depois de editar backend, rode pelo menos compilacao e lint; testes conforme risco.
- Depois de editar migrations, valide ordenacao, idempotencia esperada e compatibilidade com o banco real.
- Depois de alterar UI, valide estados de loading, erro, vazio e responsividade quando aplicavel.
- Se nao executar uma validacao, registre isso na resposta final com motivo.

## Gotchas Operacionais

Preencha esta secao com riscos reais do projeto. Exemplos:

- Testes de integracao podem ser lentos por uso de containers.
- Servidores de desenvolvimento podem ja estar rodando; evite iniciar outro processo sem necessidade.
- Builds mobile podem depender de credenciais ou SDKs locais.
- Migrations aplicadas nao devem ser editadas.
- Algumas validacoes exigem variaveis de ambiente locais.

## Git

- Nao faca commit, push, merge, rebase, amend ou force-push sem pedido explicito.
- Nao reverta mudancas de outras pessoas.
- Antes de commitar, use o workflow de pre-commit da area afetada.
- Mensagens seguem Conventional Commits em pt-BR.
- Nao adicione `Co-authored-by:` se `commit.md` proibir coautoria.

## Regras por Area

Consulte a fonte de verdade em `.windsurf/rules/`:

- Backend: regras de API, dados, seguranca, testes, observabilidade e performance.
- Frontend: regras de componentes, estado, formularios, UI, seguranca, performance e qualidade.
- Mobile: regras de navegacao, UI, estado, formularios, permissoes e build.
- Banco: regras do SGBD usado e workflow de migration.
- Transversal: commit, release e seguranca.

## Estilo de Trabalho

- Comece pelo caminho ou modulo que o usuario mencionou.
- Busque padroes existentes com `rg` antes de criar uma abstracao nova.
- Prefira alteracoes pequenas e verificaveis.
- Quando a primeira correcao nao resolver, amplie a investigacao para o fluxo completo.
- Ao finalizar, informe arquivos alterados e validacoes executadas.

