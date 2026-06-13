---
trigger: model_decision
description: Regras fundamentais para frontends web: organização, componentes, estado, dados, formulários, acessibilidade e validação.
globs: frontend/**
---

# Frontend Core

Use estas regras em projetos React, Next.js, Vue, Angular ou Vite junto com a regra da stack.

## Princípios

- A UI deve refletir regras do backend, mas não ser a fonte final de autorização.
- Separe páginas/rotas, componentes reutilizáveis, hooks/composables, services, schemas e tipos.
- Componentes devem ter props explícitas e nomes de domínio claros.
- Evite estado global quando estado local, URL ou cache de servidor resolverem.

## Dados e API

- Centralize chamadas HTTP em services/clients.
- Tipos de request/response devem refletir o contrato real da API.
- Trate loading, erro, vazio e sucesso em fluxos de dados.
- Evite fetch duplicado em renderizações ou efeitos sem dependência controlada.

## UI e Acessibilidade

- Use tokens do design system quando existirem.
- Garanta label associado, foco visível, contraste e navegação por teclado.
- Não use texto solto para explicar controles que deveriam ser autoevidentes.
- Teste responsividade em mobile e desktop para fluxos principais.

## Módulos Relacionados

- `frontend-forms.md`: formulários e validação.
- `frontend-state.md`: cache, estado remoto e estado local.
- `frontend-security.md`: XSS, tokens, rotas e variáveis públicas.
- `security-core.md`: baseline transversal.
