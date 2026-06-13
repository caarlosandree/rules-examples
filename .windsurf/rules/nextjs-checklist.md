---
trigger: always_on
description: Checklist consolidado para verificação antes de fazer commit em projetos Next.js. Reúne validações de código, UI, testes, segurança e performance.
globs: **/*.{ts,tsx}
---
# Checklist Antes de Commitar - Next.js

Antes de fazer commit, verifique os itens abaixo. Ajuste conforme as convenções específicas do projeto.

## Compilação e Testes

**No commit:** lint e typecheck são suficientes na maioria dos casos.
**No push:** build completo (`pnpm build` / `npm run build`) e execução dos testes (`pnpm test`).

- [ ] Passa no lint (`pnpm lint` / `npm run lint`)
- [ ] Passa no typecheck (`pnpm typecheck` / `tsc --noEmit`)
- [ ] Build local passa (`pnpm build`) — obrigatório antes do push
- [ ] Testes unitários passam (`pnpm test`) — obrigatório antes do push
- [ ] Testes E2E críticos passam (`pnpm test:e2e`) — quando aplicável
- [ ] Sem warnings desnecessários ou erros no console

## Estrutura e Nomenclatura

- [ ] Arquivos e componentes seguem a convenção de nomenclatura do projeto
- [ ] Componentes estão em `components/` ou `app/` conforme o escopo
- [ ] Hooks customizados usam o prefixo `use`
- [ ] Utilitários estão em `utils/` ou `lib/`
- [ ] Schemas Zod estão em `schemas/`
- [ ] Tipos reutilizáveis estão em `types/`
- [ ] Path alias `@/` é usado para imports absolutos

## App Router e Componentes

- [ ] Server Components são usados por padrão
- [ ] `'use client'` é usado apenas quando necessário (estado, efeitos, eventos, APIs do browser)
- [ ] Layouts compartilhados estão em `layout.tsx`
- [ ] Estados de carregamento estão em `loading.tsx`
- [ ] Tratamento de erro por segmento está em `error.tsx`
- [ ] Página 404 customizada está em `not-found.tsx`

## UI e Componentes

- [ ] Biblioteca de UI escolhida é usada de forma consistente
- [ ] Cores vêm de tokens do tema — nunca hex/rgb/rgba cru
- [ ] Componentes base são reutilizáveis e bem nomeados
- [ ] Acessibilidade foi considerada (`aria-label`, `htmlFor`, contraste, foco visível)
- [ ] Layout é responsivo e testado em mobile, tablet e desktop
- [ ] Imagens usam `next/image` com `alt` adequado
- [ ] Links internos usam `next/link`

## Formulários e Validação

- [ ] Formulários usam React Hook Form ou solução equivalente
- [ ] Validação usa Zod ou biblioteca equivalente
- [ ] Erros de validação são exibidos próximos aos campos
- [ ] Labels estão associadas corretamente aos inputs
- [ ] Botões de submit indicam estado de carregamento

## Estado e Dados

- [ ] Requisições HTTP usam TanStack Query ou solução equivalente quando aplicável
- [ ] Fetch de dados em Server Components é feito de forma assíncrona
- [ ] Cache e invalidações são gerenciados corretamente
- [ ] Estados globais são evitados quando Context API ou props são suficientes

## Segurança

- [ ] Não há dados sensíveis hardcoded (senhas, tokens, chaves privadas)
- [ ] Variáveis de ambiente privadas não usam prefixo `NEXT_PUBLIC_`
- [ ] Entradas de usuário são validadas no cliente e no servidor
- [ ] Não há uso de `dangerouslySetInnerHTML` sem sanitização
- [ ] Autenticação e autorização são validadas em Route Handlers

## Performance

- [ ] Imagens otimizadas com `next/image`
- [ ] Server Components são preferidos para reduzir JS no cliente
- [ ] Code splitting e lazy loading são usados quando apropriado
- [ ] `React.memo`, `useMemo` e `useCallback` são usados apenas quando necessário
- [ ] Não há requisições desnecessárias ou duplicadas

## TypeScript e Qualidade

- [ ] Tipos explícitos para props de componentes e retornos de funções
- [ ] Sem uso de `any` — prefira `unknown` quando necessário
- [ ] Tipos reutilizáveis estão em arquivos separados
- [ ] Código segue DRY sem repetição desnecessária
- [ ] Comentários explicam o porquê, não o o quê

## Tratamento de Erros

- [ ] Erros assíncronos são tratados com `try/catch` ou `.catch`
- [ ] Feedback claro é exibido ao usuário em caso de erro
- [ ] Error boundaries estão configurados quando apropriado
- [ ] Estados de erro são testados

## Git e Commits

- [ ] Commit é atômico e representa uma mudança lógica
- [ ] Mensagem de commit segue o padrão convencional (`feat:`, `fix:`, `refactor:`, etc.)
- [ ] Código não contém arquivos temporários, logs ou comentários de debug
- [ ] Não há alterações não intencionais no `package-lock.json`/`pnpm-lock.yaml`

## Referências aos Módulos de Regras

Este checklist consolida verificações dos módulos de regras Next.js:

- **nextjs-core.md**: Stack, estrutura, nomenclatura, App Router, Server Components, path alias, variáveis de ambiente
- **nextjs-ui.md**: Bibliotecas de UI, tokens de cor, componentes, acessibilidade, responsividade, imagens e links
- **nextjs-testing.md**: Vitest/Jest, React Testing Library, Playwright, mocks de fetch
