---
trigger: model_decision
description: Regras e padrões para criação de mensagens de commit seguindo Conventional Commits. Use quando o usuário solicitar fazer commit, criar mensagens de commit, ou quando precisar seguir padrões de commit do projeto.
globs: **/*
---
# Regras de Commit

## Regra absoluta: sem Co-authored-by

**Nunca** adicione linhas `Co-authored-by:` (nem variações) nas mensagens de commit. Commits deste repositório não devem conter co-autoria em rodapé. Regra obrigatória para todos os agentes.

## Formato de Mensagem de Commit

Siga o padrão **Conventional Commits** com mensagens em português brasileiro:

```
<tipo>: <descrição curta>

<corpo detalhado (opcional)>

<rodapé (opcional)>
```

## Tipos de Commit

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **refactor**: Refatoração de código (sem mudança de funcionalidade)
- **style**: Mudanças de formatação (espaços, indentação, etc.)
- **docs**: Mudanças na documentação
- **test**: Adição ou correção de testes
- **chore**: Tarefas de manutenção (dependências, build, etc.)
- **perf**: Melhorias de performance
- **ci**: Mudanças em CI/CD
- **build**: Mudanças no sistema de build

## Estrutura da Mensagem

### Descrição Curta (Obrigatória)
- Máximo de 72 caracteres
- Use imperativo ("adiciona", "corrige", "melhora")
- Sem ponto final
- Primeira letra minúscula

### Corpo Detalhado (Recomendado para mudanças complexas)
- Explique **o quê** e **por quê**, não **como**
- Organize por categorias quando houver múltiplas mudanças:
  - **Backend**: Mudanças no backend
  - **Frontend**: Mudanças no frontend
  - **Database**: Mudanças em migrations ou schema
  - **Config**: Mudanças em configurações
- Use bullet points para listar mudanças principais
- Seja específico sobre arquivos/componentes afetados

## Exemplos

### Commit Simples
```
feat: adiciona validação de email no formulário de cadastro
```

### Commit Detalhado (Recomendado)
```
feat: melhorias em autenticação e rate limiting

Backend:
- Adiciona método clearLoginRateLimit() em RateLimitingConfig
- Melhora tratamento de rate limiting no RateLimitingFilter

Frontend - Autenticação:
- Melhora tratamento de erros na página de login
- Adiciona tratamento específico para erro 429 (rate limit)

Frontend - Componentes:
- Refatora Sidebar e Layout
- Remove código não utilizado
```

### Commit de Correção
```
fix: corrige erro de validação no schema de email

- Ajusta schema para usar transform correto
- Garante valores padrão corretos para flags booleanas
- Corrige tipos TypeScript afetados
```

### Commit de Refatoração
```
refactor: reorganiza estrutura de componentes do dashboard

- Move componentes específicos para pasta dashboard/
- Separa lógica de apresentação de lógica de negócio
- Melhora legibilidade e manutenibilidade do código
```

## Boas Práticas

1. **Seja Descritivo**: A mensagem deve deixar claro o que foi alterado e por quê
2. **Organize por Categorias**: Quando houver múltiplas mudanças, organize por stack/área
3. **Seja Específico**: Mencione arquivos, componentes ou funcionalidades principais afetadas
4. **Use Imperativo**: "adiciona" ao invés de "adicionado" ou "adicionando"
5. **Uma Mudança Lógica por Commit**: Evite misturar múltiplas funcionalidades não relacionadas
6. **Mencione Breaking Changes**: Se houver, indique claramente no corpo do commit

## Fluxo de Branches

- Desenvolva em um branch de feature/fix (ex.: `feat/...`, `fix/...`) ou em `develop`/`homolog`, conforme o projeto.
- Não execute `git push`, `git merge` ou force-push sem solicitação explícita do usuário.

## Checklist Antes de Commitar

- [ ] Mensagem segue o padrão Conventional Commits
- [ ] Descrição curta é clara e objetiva (máx. 72 caracteres)
- [ ] Corpo detalhado está presente quando necessário
- [ ] Mudanças estão organizadas por categoria
- [ ] Arquivos/componentes principais estão mencionados
- [ ] Breaking changes estão documentadas (se houver)
- [ ] Código compila/linta e testes passam (quando aplicável)
