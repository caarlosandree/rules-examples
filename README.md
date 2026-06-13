# rules-examples

Catálogo de regras de desenvolvimento para agentes de IA, organizado por stack e superfície de aplicação. Serve como **fonte de referência** para configurar projetos novos ou existentes com padrões prontos para uso com Claude Code, Cursor, Windsurf, Copilot e equivalentes.

## O que é isso

Um repositório de regras (`.windsurf/rules/`) e workflows (`.windsurf/workflows/`) que você copia para o seu projeto. Cada regra é um arquivo Markdown com frontmatter que o agente de IA lê para entender convenções, restrições e padrões do projeto.

Após copiar, o agente já sabe:

- Como estruturar controllers, services e repositórios.
- Quais padrões de commit e release seguir.
- O que validar antes de finalizar cada tarefa.
- Como lidar com segurança, banco de dados e testes.

## Stacks cobertas

| Stack | Arquivos de regra |
|---|---|
| **Java** (Spring Boot / Jakarta EE) | `java-core.md`, `java-api.md`, `java-testing.md`, `java-checklist.md` |
| **Go** (Gin / Echo / Fiber) | `go-core.md`, `go-api.md`, `go-testing.md`, `go-checklist.md` |
| **NestJS** (Node.js + TypeScript) | `nestjs-core.md`, `nestjs-api.md`, `nestjs-testing.md`, `nestjs-checklist.md` |
| **Next.js** (React 18/19 + App Router) | `nextjs-core.md`, `nextjs-ui.md`, `nextjs-testing.md`, `nextjs-checklist.md` |
| **Python** (FastAPI / Django / Flask) | `python-core.md`, `python-api.md`, `python-testing.md`, `python-checklist.md` |
| **Vue 3** (Composition API) | `vue-core.md`, `vue-ui.md`, `vue-testing.md`, `vue-checklist.md` |
| **Vite** (React / Vue / Svelte) | `vite-core.md`, `vite-checklist.md` |
| **Angular** (17+, standalone components) | `angular-core.md`, `angular-ui.md`, `angular-testing.md`, `angular-checklist.md` |
| **Mobile** (React Native / Expo) | `mobile-core.md`, `mobile-checklist.md` |

## Regras transversais

Aplicáveis a qualquer stack:

| Arquivo | Finalidade |
|---|---|
| `commit.md` | Conventional Commits em pt-BR |
| `release.md` | Fluxo de versionamento e release notes |
| `security-core.md` | Baseline de segurança (OWASP Top 10) |
| `security-analysis.md` | Checklist para auditorias profundas |
| `backend-core.md` | Padrões transversais de API (camadas, DTOs, erros) |
| `backend-api.md` | Contratos REST, paginação, versionamento |
| `backend-security.md` | Autenticação, autorização, secrets |
| `backend-observability.md` | Logs estruturados, métricas, tracing |
| `frontend-core.md` | Componentes, estado, formulários e qualidade |
| `frontend-state.md` | Gerenciamento de estado remoto e local |
| `frontend-security.md` | XSS, CSRF, exposição de dados no bundle |
| `frontend-forms.md` | Validação, UX e acessibilidade em formulários |
| `postgresql.md` | Queries, índices, migrations e performance |
| `mysql.md` | Idem para MySQL |
| `mongodb.md` | Idem para MongoDB |

## Estrutura do repositório

```
rules-examples/
├── .windsurf/
│   ├── rules/              ← fonte de verdade central (48 arquivos)
│   │   ├── commit.md
│   │   ├── release.md
│   │   ├── security-*.md
│   │   ├── {stack}-core.md
│   │   ├── {stack}-api.md | {stack}-ui.md
│   │   ├── {stack}-testing.md
│   │   └── {stack}-checklist.md
│   └── workflows/          ← runbooks procedurais
│       ├── build.md
│       ├── lint.md
│       ├── test.md
│       ├── commit.md
│       ├── review.md
│       ├── migration.md
│       ├── typecheck.md
│       ├── search-rules.md
│       ├── pre-commit-backend.md
│       ├── pre-commit-frontend.md
│       └── pre-commit-mobile.md
├── templates/
│   ├── AGENTS.md           ← template de AGENTS.md para o projeto destino
│   └── CLAUDE.md           ← template de CLAUDE.md para o projeto destino
├── AGENTS.md               ← instruções para agentes neste repositório
├── Backend/README.md       ← guia de adoção por superfície
├── Frontend/README.md
├── Mobile/README.md
├── {Stack}/README.md       ← guia de adoção por stack
└── README.md
```

## Comando `/setup-rules` para Claude Code

Este repositório inclui um comando que transforma o Claude Code em um **arquiteto de regras**: ele analisa o projeto, entrevista o time e **gera regras originais e personalizadas** — usando este repo como referência de padrões, não como fonte de cópia.

### Instalação global

```bash
curl -fsSL https://raw.githubusercontent.com/caarlosandree/rules-examples/main/.claude/commands/setup-rules.md \
  -o ~/.claude/commands/setup-rules.md
```

### Uso

Abra qualquer projeto no Claude Code e execute:

```
/setup-rules
```

### O que acontece

**1. Diagnóstico automático** — O Claude lê `package.json`, `go.mod`, `pom.xml`, `docker-compose.yml`, `Makefile`, `README.md` e a estrutura de pastas para entender o projeto antes de fazer qualquer pergunta.

**2. Entrevista** — Com o diagnóstico em mãos, o Claude faz perguntas objetivas:
- Quais agentes de IA o time usa? *(múltipla escolha: Claude Code, Cursor, Windsurf, Copilot, Cline…)*
- A stack detectada está correta?
- Qual o banco de dados?
- Qual o tipo do projeto? *(API, fullstack, monorepo, mobile…)*
- Há convenções ou restrições do time que as regras devem reforçar?

**3. Leitura das referências** — O Claude lê os arquivos relevantes deste repo via GitHub como referência de padrões e boas práticas para a stack do projeto.

**4. Geração de regras personalizadas** — Com base no diagnóstico, nas respostas e nas referências, o Claude escreve regras **específicas para este projeto**: nomes reais de módulos, comandos reais de build/test, restrições do time integradas, exemplos de código com a stack real.

**5. Escrita multi-agente** — As regras são gravadas no local certo para cada agente selecionado:

| Agente | Destino |
|---|---|
| Claude Code | `CLAUDE.md` + `.claude/commands/` |
| Cursor | `.cursor/rules/*.mdc` |
| Windsurf | `.windsurf/rules/*.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Cline / Continue | `.clinerules` / `.continuerules` |

**6. Resumo** — Lista de arquivos criados por agente, pontos que o time deve revisar e como evoluir as regras no futuro.

### Instalação rápida com npx *(alternativa sem Claude Code)*

Para instalar regras genéricas baseadas na stack sem passar pela entrevista:

```bash
npx setup-ai-rules
```

---

## Como usar (manual)

### 1. Escolha a entrada

- **Por stack** — abra `{Stack}/README.md` (ex: `NestJS/README.md`) para ver exatamente quais arquivos copiar.
- **Por superfície** — abra `Backend/`, `Frontend/` ou `Mobile/` se o projeto mistura stacks.

### 2. Copie os arquivos de regra

```bash
# exemplo: projeto NestJS com PostgreSQL
cp .windsurf/rules/nestjs-*.md   /meu-projeto/.windsurf/rules/
cp .windsurf/rules/backend-*.md  /meu-projeto/.windsurf/rules/
cp .windsurf/rules/postgresql.md /meu-projeto/.windsurf/rules/
cp .windsurf/rules/commit.md     /meu-projeto/.windsurf/rules/
cp .windsurf/rules/release.md    /meu-projeto/.windsurf/rules/
cp .windsurf/rules/security-*.md /meu-projeto/.windsurf/rules/
```

### 3. Configure os arquivos de instruções

```bash
cp templates/AGENTS.md /meu-projeto/AGENTS.md
cp templates/CLAUDE.md /meu-projeto/CLAUDE.md
```

Edite os dois arquivos para refletir a estrutura real do projeto: paths, comandos canônicos, stack, banco e restrições operacionais.

### 4. Ajuste as regras copiadas

Substitua placeholders em cada arquivo `.md`:

- Versões de dependências (`Java 21`, `Node 22`, etc.)
- Comandos de build/test/lint específicos do projeto.
- Nomes de módulos, packages e namespaces reais.
- Restrições operacionais (ex: "não use feature flags em produção sem aprovação").

### 5. Valide com o agente

Abra o projeto no seu agente de IA e peça para ele listar as regras ativas. Se responder com as convenções corretas, a configuração está funcionando.

## Convenções deste repositório

- Todo arquivo de regra tem frontmatter obrigatório:
  ```yaml
  ---
  trigger: always_on | model_decision
  description: <descrição curta do escopo>
  globs: <padrões de glob quando trigger = model_decision>
  ---
  ```
- Workflows têm frontmatter simplificado (`description` apenas).
- Regras escritas em português brasileiro.
- Sem duplicação entre arquivos; use `Módulos Relacionados` para referenciar outros arquivos.
- Sem caminhos absolutos de máquina local, credentials ou secrets.

## Contribuindo

1. Abra uma issue descrevendo a stack ou padrão que falta.
2. Crie um branch `feat/<stack>` ou `fix/<regra>`.
3. Siga o padrão de frontmatter e a estrutura dos arquivos existentes.
4. Abra um PR apontando o que foi adicionado ou corrigido.
