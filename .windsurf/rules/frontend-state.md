---
trigger: model_decision
description: Regras para estado frontend: estado local, URL, cache remoto, invalidação, otimistic UI e persistência.
globs: frontend/**
---

# Frontend State

## Ordem de Preferência

1. Estado derivado de props/dados existentes.
2. Estado local do componente.
3. URL/search params para filtros, abas e paginação compartilháveis.
4. Cache de servidor (TanStack Query, SWR, Apollo, framework data cache).
5. Estado global somente quando múltiplas áreas independentes precisam escrever/ler.

## Estado Remoto

- Use query keys estáveis e específicas.
- Invalide ou atualize cache depois de mutation.
- Não duplique dados remotos em store global sem necessidade.
- Trate loading inicial, refetch, erro e empty state.

## Persistência

- Persistir preferências simples é aceitável; persistir dados sensíveis no browser exige justificativa.
- Nunca salve token secreto em storage se o projeto usa cookie httpOnly.
- Versione formato de dados persistidos quando houver risco de incompatibilidade.

## Módulos Relacionados

- `frontend-core.md`: organização geral.
- `frontend-security.md`: storage, tokens e exposição de dados.
- `nextjs-core.md`, `vue-core.md`, `angular-core.md`, `vite-core.md`: regras por stack.
