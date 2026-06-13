---
trigger: model_decision
description: Regras fundamentais para apps mobile React Native/Expo: estrutura, navegação, API, estado, formulários, segurança e performance.
globs: mobile/**
---

# Mobile Core

## Stack Esperada

- React Native ou Expo com TypeScript.
- Navegação tipada com React Navigation ou roteador equivalente.
- Cliente HTTP centralizado.
- Estado remoto com TanStack Query ou solução equivalente.
- Formulários com React Hook Form + Zod ou alternativa equivalente.

## Organização

- `src/app` ou `src/navigation` para navegação.
- `src/screens` para telas.
- `src/components` para componentes reutilizáveis.
- `src/services` para API e integrações.
- `src/hooks`, `src/types`, `src/utils`, `src/constants`.
- Alias `@/` para `src` quando configurado.

## UX Mobile

- Respeite safe area, teclado, loading, empty state e erro offline.
- Use listas virtualizadas (`FlatList`, `SectionList`, FlashList) para coleções grandes.
- Não use `ScrollView` para listas extensas.
- Garanta alvos de toque confortáveis e estados disabled/loading.

## Segurança

- API deve usar HTTPS.
- Não hardcode tokens, URLs privadas ou secrets.
- Armazene tokens em storage seguro quando disponível.
- Limpe dados sensíveis no logout.
- Valide entradas também no backend.

## Validação

- Após alteração mobile, rode ao menos lint/typecheck definidos no projeto.
- Para mudanças visuais críticas, valide em simulador/emulador quando possível.

## Módulos Relacionados

- `mobile-checklist.md`: checklist antes de finalizar.
- `frontend-forms.md`: formulários e validação reaproveitáveis.
- `security-core.md`: baseline transversal.
