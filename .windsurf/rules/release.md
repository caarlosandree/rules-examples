---
trigger: model_decision
description: Regras para o processo de Release: versionamento semântico, criação de tags, releases no GitHub, uso de drafts e notas de versão. Consulte ao planejar merge na main, criar tags, publicar releases ou implementar páginas de release notes.
globs: **/*
---
# Regras de Release

Esta regra define o processo de **Release**: versionamento semântico, criação e envio de tags, criação de releases no GitHub, uso de rascunhos e documentação de alterações. Está alinhada às mensagens de commit (Conventional Commits) definidas em `commit.md`.

## Objetivo

- Manter um histórico claro e imutável de versões.
- Permitir que usuários e suporte consultem o que mudou em cada versão.
- Automatizar a decisão **major** vs **minor** com base no que entra no merge para `main`.
- Garantir que toda alteração que sobe para `main` seja acompanhada de uma release (tag + GitHub Release).

## Versionamento Semântico (SemVer)

Siga **Semantic Versioning** ([semver.org](https://semver.org/lang/pt-BR/)) no formato:

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: mudanças incompatíveis com versões anteriores (breaking changes) ou novas funcionalidades de grande impacto.
- **MINOR**: novas funcionalidades compatíveis com versões anteriores, ou conjunto de correções/ajustes/refactors que justifiquem uma nova versão.
- **PATCH**: correções de bugs compatíveis e pequenos ajustes que não alteram contrato nem comportamento visível de forma relevante.

Para o fluxo de merge na `main`, adote **MAJOR e MINOR** como critérios principais:

| Tipo de release | Quando usar | Tipos de commit que indicam |
|-----------------|-------------|-----------------------------|
| **Major** | Nova(s) feature(s) ou mudança significativa de produto | Pelo menos um commit `feat` ou BREAKING |
| **Minor** | Refactors, ajustes, docs, testes, chore, perf, ci, build (sem feat nem fix) | Apenas `refactor`, `style`, `docs`, `test`, `chore`, `perf`, `ci`, `build` |
| **Patch** | Apenas correções de bug (fix) | Apenas `fix` no conjunto |

Regra prática ao fazer merge na `main`:

1. **Se o conjunto de commits contiver algum `feat` (ou BREAKING)** → release **MAJOR**.
2. **Se contiver apenas `fix`** → release **PATCH**.
3. **Se contiver apenas refactor, docs, test, chore, etc.** → release **MINOR**.

## Fluxo Obrigatório: Merge na Main → Nova Release

**Sempre que for dar merge na `main`**, é necessário que exista uma release (tag + GitHub Release). Não esqueça de escrever as release notes em todo merge para a `main`.

### Automação (recomendado)

- Use workflows de CI/CD para calcular a próxima versão a partir dos commits e criar tag/release automaticamente.
- Exemplo: push na `main` dispara cálculo de versão, criação da tag `vX.Y.Z` e draft da release.

### Manual

1. Decidir o tipo de release (major/minor/patch) com base nos commits.
2. Definir a nova versão e criar a tag no commit de merge: `git tag -a vX.Y.Z -m "Release X.Y.Z"` e `git push origin vX.Y.Z`.
3. Criar a release no GitHub (Releases → Draft a new release) associada à tag.
4. Preencher/revisar as notas de versão e publicar a release.

Não faça merge na `main` sem que a release correspondente tenha sido criada (tag + GitHub Release). A release pode ficar em Draft até a publicação.

## Responsabilidade do Agente

**Sempre que houver merge na `main` e a tag tiver sido criada (e enviada ao remoto), o agente deve criar também a Release no GitHub.** Tag e Release são um par obrigatório: não basta criar apenas a tag.

- **Quando**: logo após a criação (e push) da tag correspondente ao merge na `main`.
- **O que fazer**: criar a GitHub Release associada à tag, em **Draft**, com notas de versão.
- **Como**: via GitHub CLI (`gh release create <tag> --draft --generate-notes --title "Release vX.Y.Z"`) ou via API do GitHub.
- **Objetivo**: garantir que cada tag tenha sua release criada, evitando tags órfãs.

## Criar e Enviar Tags

- **Formato da tag**: `vMAJOR.MINOR.PATCH` (ex.: `v1.2.0`, `v2.0.0`).
- **Onde criar**: no commit que representa o estado da release (geralmente o merge commit na `main`).

```bash
# Exemplo: criar tag v1.3.0 no commit atual (após merge na main)
git tag -a v1.3.0 -m "Release 1.3.0: correções e melhorias"

# Enviar a tag para o remoto
git push origin v1.3.0
```

## Criar Release no GitHub

- **Boas práticas**:
  - Utilize rascunhos (Drafts) para revisar as notas antes de publicar.
  - Aproveite as notas de versão geradas automaticamente e complemente com descrição em português.
- **Passos sugeridos**:
  1. No repositório GitHub: **Releases** → **Draft a new release**.
  2. Escolher a tag criada (ex.: `v1.3.0`).
  3. Título sugerido: `Release v1.3.0`.
  4. Gerar/editar as release notes.
  5. Anexar ativos se houver.
  6. Publicar quando estiver pronto.

## Checklist Antes de Publicar uma Release

- [ ] Tipo de release (major/minor/patch) definido com base nos commits do merge.
- [ ] Versão definida (MAJOR.MINOR.PATCH) e tag criada no formato `vMAJOR.MINOR.PATCH`.
- [ ] Tag enviada para o remoto (`git push origin <tag>`).
- [ ] **Release criada no GitHub** (inicialmente como Draft).
- [ ] Notas de versão preenchidas (auto-geradas e/ou texto em português).
- [ ] Ativos anexados na release (se aplicável).
- [ ] Release publicada (sai de Draft).

## Referências

- **commit.md**: Tipos de commit e fluxo de branches.
- Semantic Versioning: [semver.org](https://semver.org/lang/pt-BR/).
- Documentação GitHub: [Creating a release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository).
