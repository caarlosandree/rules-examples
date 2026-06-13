# Agent Instructions (Rules Examples)

## Propósito

Este repositório centraliza **regras genéricas de desenvolvimento** para múltiplas linguagens e frameworks. Ele serve como **template reutilizável** para projetos que querem adotar um padrão de regras por agentes de IA.

## Estrutura

- `.windsurf/rules/`: **fonte de verdade central** com todas as regras granularizadas.
- `.windsurf/workflows/`: runbooks procedurais (build, lint, test, commit, review e validações específicas).
- `{JAVA,GO,NestJS,NextJS,Python,VUE,VITE,Angular}/`: subpastas de entrada por stack. Cada uma contém um `README.md` apontando para as regras centrais.
- `{Backend,Frontend,Mobile}/`: entradas por superfície de aplicação para projetos que preferem escolher regras por camada.

## Como usar

1. Identifique a stack do projeto destino.
2. Copie os arquivos `.windsurf/rules/{prefixo}-*.md` relevantes para o `.windsurf/rules/` do projeto.
3. Copie regras transversais aplicáveis (`commit.md`, `release.md`, `security-core.md`, `security-analysis.md`, `postgresql.md`, `mysql.md`, `mongodb.md`).
4. Ajuste exemplos, comandos, caminhos, versões e restrições operacionais ao contexto real do projeto.
5. Mantenha `AGENTS.md` do projeto destino como mapa operacional: estrutura, comandos canônicos, restrições e regras obrigatórias.

## Convenções deste repo

- Regras escritas em **português brasileiro**.
- Frontmatter obrigatório em cada arquivo `.md` de regra:
  ```yaml
  ---
  trigger: always_on | model_decision
  description: ...
  globs:
  ---
  ```
- Workflows têm frontmatter simplificado:
  ```yaml
  ---
  description: ...
  ---
  ```

## Restrições

- Não altere regras já aplicadas em projetos sem versionar a mudança.
- Não duplique regras entre arquivos; use `Módulos Relacionados` para referenciar.
- Não use caminhos absolutos da máquina local em regras ou READMEs do template.
- Não adicione credenciais reais, tokens, URIs com senha ou exemplos copiáveis de secrets.
