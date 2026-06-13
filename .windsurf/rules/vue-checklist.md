---
trigger: always_on
description: Checklist pré-commit para projetos Vue 3 - validações de código, UI, testes, segurança e documentação antes de abrir PR.
globs: **/*.{vue,ts,js}
---
# Checklist Pré-Commit - Vue 3

Use este checklist antes de cada commit ou pull request em projetos Vue 3.

## ✅ Validação de Código

- [ ] `pnpm lint` (ou `npm run lint`) passa sem erros
- [ ] `pnpm typecheck` (ou `vue-tsc --noEmit`) passa sem erros
- [ ] Não há `console.log`, `debugger` ou código de debug esquecido
- [ ] Não há imports não utilizados
- [ ] Não há variáveis declaradas e não utilizadas
- [ ] Não há comentários redundantes ou explicativos demais
- [ ] Código segue indentação de 2 espaços e formatação do projeto

## ✅ Componentes Vue

- [ ] Componentes novos usam `<script setup lang="ts">`
- [ ] Props estão tipadas com interface
- [ ] Emits estão declarados e tipados
- [ ] Slots são usados quando o componente precisa de flexibilidade
- [ ] Componentes base são reutilizados em vez de recriados
- [ ] Estilos usam `scoped` ou CSS Modules quando apropriado
- [ ] Não há valores hardcoded de cores, espaçamento ou tipografia

## ✅ Composition API e Reatividade

- [ ] Refs são acessadas com `.value`
- [ ] `computed` é usado para valores derivados
- [ ] `watch` possui dependências explícitas
- [ ] Desestruturação de stores usa `storeToRefs`
- [ ] Lógica reutilizável foi extraída para composables
- [ ] Não há mutação direta de estado da Pinia fora das actions

## ✅ Pinia e Estado

- [ ] Stores seguem padrão `use{Nome}Store.ts`
- [ ] Estado, getters e actions estão separados
- [ ] Stores não contêm lógica de UI ou formatação
- [ ] Estado global é realmente necessário (não over-engineering)

## ✅ Vue Router

- [ ] Rotas estão definidas em `src/router/routes.ts`
- [ ] Views grandes usam lazy loading
- [ ] Guards de navegação estão implementados quando necessário
- [ ] Navegação programática usa nomes de rotas quando possível

## ✅ API e Serviços

- [ ] Chamadas HTTP estão centralizadas em `src/services/`
- [ ] `apiClient` possui base URL configurada via `VITE_`
- [ ] Erros de API são tratados e exibidos ao usuário
- [ ] Loading states estão implementados

## ✅ UI/UX e Acessibilidade

- [ ] Componentes usam design system/tokens definidos
- [ ] Layout é responsivo (mobile-first)
- [ ] Contraste de cores está adequado
- [ ] Botões de ícone possuem `aria-label`
- [ ] Inputs possuem `<label>` associado
- [ ] Erros de formulário são anunciados corretamente
- [ ] Foco é gerenciado em modais e drawers
- [ ] Animações respeitam `prefers-reduced-motion`

## ✅ Testes

- [ ] Testes unitários passam: `pnpm test:unit`
- [ ] Composables críticos possuem testes
- [ ] Stores possuem testes
- [ ] Componentes complexos possuem testes
- [ ] Mocks de stores, router e serviços estão corretos
- [ ] E2E cobre fluxos críticos quando aplicável

## ✅ Segurança

- [ ] Não há segredos hardcoded (chaves, tokens, senhas)
- [ ] Variáveis de ambiente sensíveis não usam prefixo `VITE_`
- [ ] Inputs de usuário são validados antes de envio
- [ ] Conteúdo dinâmico é escapado corretamente (evite `v-html` com dados não confiáveis)
- [ ] Autenticação e autorização estão verificadas nas rotas protegidas

## ✅ Performance

- [ ] Views grandes usam lazy loading
- [ ] Componentes pesados usam `defineAsyncComponent`
- [ ] Listas grandes usam virtualização quando necessário
- [ ] Não há watchers desnecessários
- [ ] Imagens são otimizadas

## ✅ Git e Commits

- [ ] Commits são atômicos e focados
- [ ] Mensagens seguem o padrão do `commit.md`
- [ ] Um commit = uma mudança lógica
- [ ] Não há arquivos não relacionados no commit
- [ ] Branch está atualizada com a base (homolog/main conforme projeto)

## ✅ Documentação

- [ ] README está atualizado se necessário
- [ ] Variáveis de ambiente novas foram adicionadas ao `.env.example`
- [ ] Decisões complexas estão documentadas
- [ ] Componentes reutilizáveis possuem exemplos de uso

## Comando Rápido de Validação

Antes de abrir PR, execute:

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
```

Se qualquer um falhar, corrija antes de prosseguir.

## Módulos Relacionados

- **vue-core.md**: Stack, estrutura de pastas, Composition API, Pinia, Vue Router
- **vue-ui.md**: Design system, componentes reutilizáveis, acessibilidade
- **vue-testing.md**: Vitest, Vue Test Utils, Playwright/Cypress
- **commit.md**: Padrões de mensagens de commit
