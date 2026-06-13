---
trigger: always_on
description: Regras fundamentais de desenvolvimento Vue 3 - stack, princípios, estrutura de pastas, nomenclatura, formatação, Composition API, reatividade, Pinia, Vue Router e commits.
globs: **/*.{vue,ts,js}
---
# Regras de Desenvolvimento - Vue Core

## Stack Tecnológica

Este projeto utiliza:
- **Vue 3** (3.4+) como framework progressivo de UI
- **Composition API** como padrão de organização de lógica reativa
- **TypeScript** para tipagem estática (`strict: true`)
- **Vite** como build tool e dev server
- **Vue Router 4** para roteamento SPA
- **Pinia** para gerenciamento de estado global
- **ESLint** com `@vue/eslint-config-typescript` para linting
- **Prettier** para formatação (se configurado no projeto)
- **Vitest** para testes unitários
- **Vue Test Utils** para testes de componentes
- **Playwright** ou **Cypress** para testes E2E
- **Path alias `@/`**: aponta para a pasta `src/` do projeto (`@/components`, `@/stores`, `@/services`)

## Princípios Gerais

### Código Limpo e Legível
- Sempre escreva componentes e funções fáceis de entender
- Priorize clareza sobre concisão quando necessário
- Use nomes descritivos que expliquem o propósito do código

### Consistência
- Mantenha o estilo de codificação consistente em todo o projeto
- Siga os padrões estabelecidos neste arquivo e no projeto
- Use as mesmas convenções de nomenclatura em arquivos relacionados

### Programação para Manutenção
- Escreva código pensando em quem vai mantê-lo no futuro
- Documente decisões complexas ou não óbvias
- Facilite a localização e correção de bugs

## Organização e Estrutura

### Estrutura de Pastas

```
src/
  ├── assets/          # Imagens, ícones, fontes, estilos globais
  ├── components/      # Componentes reutilizáveis (globais e locais)
  │     ├── common/    # Componentes genéricos compartilhados (BaseButton, BaseInput)
  │     └── features/  # Componentes específicos de domínio (UserCard, OrderList)
  ├── composables/     # Composables reutilizáveis (useAuth, useFetch)
  ├── views/           # Páginas/Views roteadas (HomeView, DashboardView)
  ├── layouts/         # Layouts de página (MainLayout, AuthLayout)
  ├── stores/          # Stores Pinia (authStore, userStore)
  ├── services/        # Clientes HTTP e serviços de API (apiClient, userService)
  ├── router/          # Configuração do Vue Router (index.ts, routes.ts, guards)
  ├── types/           # Tipos TypeScript globais (User.ts, ApiResponse.ts)
  ├── utils/           # Funções utilitárias puras (formatDate, storage)
  ├── App.vue          # Componente raiz
  └── main.ts          # Ponto de entrada da aplicação
```

### Nomenclatura

#### Arquivos e Pastas
- Componentes: **PascalCase** (ex: `UserProfile.vue`, `BaseButton.vue`)
- Composables: prefixo `use` + **camelCase** (ex: `useAuth.ts`, `useLocalStorage.ts`)
- Views/Páginas: **PascalCase** com sufixo `View` (ex: `HomeView.vue`, `DashboardView.vue`)
- Layouts: **PascalCase** com sufixo `Layout` (ex: `MainLayout.vue`)
- Stores Pinia: **camelCase** com sufixo `Store` no nome da função (ex: `useAuthStore.ts`)
- Serviços: **camelCase** (ex: `userService.ts`, `apiClient.ts`)
- Utilitários: **camelCase** (ex: `formatDate.ts`, `validators.ts`)
- Tipos/Interfaces: **PascalCase** (ex: `User.ts`, `ApiResponse.ts`)

#### Variáveis e Funções
- Variáveis e funções: **camelCase** (ex: `userName`, `getUserData`)
- Constantes: **UPPER_SNAKE_CASE** (ex: `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`)
- Componentes Vue: **PascalCase** (ex: `UserProfile`, `BaseButton`)
- Props e emits: **camelCase** (ex: `userId`, `update:modelValue`)

#### Nomes Descritivos
- ✅ **Bom**: `handleSubmitForm`, `calculateTotalPrice`, `isUserAuthenticated`
- ❌ **Ruim**: `handle`, `calc`, `flag`, `x`, `data`, `temp`

### Organização do Código

#### Estrutura de Componentes Vue

```vue
<script setup lang="ts">
// 1. Imports (externos, internos, types)
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { BaseButton } from '@/components/common/BaseButton.vue'
import type { User } from '@/types/User'

// 2. Props e emits
interface Props {
  title: string
  userId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: UserFormData]
  'update:modelValue': [value: string]
}>()

// 3. Stores e router
const authStore = useAuthStore()
const router = useRouter()

// 4. Estado reativo local
const isLoading = ref(false)
const userName = ref('')

// 5. Computed
const isFormValid = computed(() => userName.value.length > 0 && !isLoading.value)

// 6. Watchers
watch(() => props.userId, (newId) => {
  if (newId) {
    loadUser(newId)
  }
})

// 7. Lifecycle hooks
onMounted(() => {
  loadUser(props.userId)
})

// 8. Funções e handlers
async function loadUser(id: string) {
  isLoading.value = true
  try {
    await authStore.fetchUser(id)
  } finally {
    isLoading.value = false
  }
}

function handleSubmit() {
  if (!isFormValid.value) return

  emit('submit', {
    name: userName.value,
    userId: props.userId,
  })
}
</script>

<template>
  <div class="user-profile">
    <h1>{{ title }}</h1>
    <BaseButton :disabled="!isFormValid" @click="handleSubmit">
      Salvar
    </BaseButton>
  </div>
</template>

<style scoped>
.user-profile {
  padding: 1rem;
}
</style>
```

#### Funções e Rotinas
- Mantenha funções pequenas e com responsabilidade única
- Máximo de ~30 linhas por função quando possível
- Se uma função faz mais de uma coisa, divida-a
- Use composables para lógica reutilizável entre componentes

### Indentação e Formatação
- Use **2 espaços** para indentação (não tabs)
- Use aspas simples para strings quando possível
- Sempre inclua ponto e vírgula no final das declarações TypeScript
- Mantenha linhas com máximo de 100 caracteres
- Ordene `<script>`, `<template>`, `<style>` nessa ordem em SFCs
- Use `lang="ts"` em todo `<script setup>`
- Use `scoped` para estilos específicos do componente

### Comentários

#### Comentários de Arquivo
```typescript
/**
 * Componente: UserProfile
 *
 * Descrição: Exibe o perfil completo do usuário com informações básicas,
 * estatísticas e ações rápidas.
 *
 * @author Carlos André Sabino
 * @created Dia de hoje
 */
```

#### Comentários no Código
- Comente apenas o **porquê**, não o **o quê**
- Comente lógica complexa ou não óbvia
- Evite comentários redundantes
- Use comentários JSDoc para funções públicas e composables

```typescript
// ✅ Bom: Explica o porquê
// Debounce para evitar muitas requisições durante digitação
const debouncedSearch = useDebounce(searchTerm, 300)

// ❌ Ruim: Redundante
// Incrementa o contador
count.value++
```

## Padrões Específicos do Stack

### Vue 3 e Composition API
- Use **Composition API** com `<script setup>` em todos os componentes novos
- Evite Options API em componentes novos (mantenha legado apenas quando necessário)
- Prefira `ref` para tipos primitivos e `reactive` para objetos complexos quando apropriado
- Use `computed` para valores derivados
- Use `watch` e `watchEffect` com cautela — prefira `watch` com dependências explícitas

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const firstName = ref('Maria')
const lastName = ref('Silva')

// ✅ Bom: computed para valor derivado
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// ❌ Ruim: duplicar lógica no template
// {{ firstName + ' ' + lastName }}
</script>
```

### `<script setup>`
- Sempre use `<script setup lang="ts">` para componentes novos
- Declare `defineProps` com interface tipada
- Declare `defineEmits` com eventos tipados
- Use `defineExpose` apenas quando for necessário expor métodos ao pai
- Evite `defineOptions` a menos que seja necessário configurar opções do componente

```vue
<script setup lang="ts">
interface Props {
  modelValue: string
  label: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: []
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
```

### Reatividade
- Use `.value` para acessar/mutar `ref`s
- Prefira `readonly` ou props para dados que não devem ser mutados diretamente
- Desestruture refs reativos com cautela — elas perdem a reatividade
- Use `toRefs` ou `storeToRefs` (Pinia) para desestruturar reativamente

```typescript
// ✅ Bom: storeToRefs mantém reatividade
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/useAuthStore'

const authStore = useAuthStore()
const { user, isAuthenticated } = storeToRefs(authStore)

// ❌ Ruim: desestruturação comum perde reatividade
const { user, isAuthenticated } = useAuthStore()
```

### Pinia (Stores)
- Use **Pinia** como única solução de estado global
- Crie uma store por domínio (ex: `useAuthStore`, `useUserStore`)
- Nomeie arquivos como `use{Domínio}Store.ts`
- Separe estado, getters e actions
- Use `storeToRefs` para ler estado reativo em componentes
- Chame actions diretamente da store
- Evite mutar o estado fora das actions

```typescript
// src/stores/useAuthStore.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types/User'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => user.value !== null)

  // Actions
  async function login(email: string, password: string) {
    isLoading.value = true
    try {
      user.value = await authService.login(email, password)
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  }
})
```

### Vue Router
- Defina rotas em `src/router/routes.ts`
- Use lazy loading para views grandes
- Use navigation guards para autenticação/autorização
- Prefira `useRouter` e `useRoute` em `<script setup>`
- Nomeie rotas quando necessário para navegação programática

```typescript
// src/router/routes.ts
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
]

export default routes
```

```typescript
// src/router/guards.ts
import type { NavigationGuard } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

export const authGuard: NavigationGuard = (to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
}
```

### TypeScript
- Use `strict: true` no `tsconfig.json`
- Evite `any` — prefira tipos específicos ou `unknown`
- Defina tipos para todas as props, emits e retornos de função
- Use type imports quando apropriado: `import type { User } from '@/types/User'`
- Tipifique refs com generics: `const count = ref<number>(0)`

### Imports e Path Alias
- Use path alias `@/` para imports absolutos
- Mantenha imports organizados: externos → internos → types
- Não use imports relativos complexos como `../../../components/Button`

```typescript
// ✅ Bom: Organização de imports
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { BaseButton } from '@/components/common/BaseButton.vue'
import type { User } from '@/types/User'
import { formatDate } from '@/utils/date'

// ❌ Ruim: Imports desorganizados e relativos complexos
import { BaseButton } from '../../../components/common/BaseButton.vue'
import { ref } from 'vue'
import { formatDate } from '@/utils/date'
```

### Variáveis de Ambiente
- Variáveis públicas para o cliente devem ter prefixo `VITE_`
- Use `import.meta.env.VITE_API_URL` para acessar no código
- Não exponha segredos em variáveis `VITE_`
- Crie um arquivo `.env.example` com todas as variáveis necessárias

```typescript
// ✅ Bom
const apiUrl = import.meta.env.VITE_API_URL

// ❌ Ruim: variável sem prefixo VITE_ não estará disponível no build
const apiUrl = process.env.API_URL
```

## Boas Práticas Adicionais

### Comunicação entre Componentes
- Use props down / events up para comunicação pai-filho
- Use `v-model` para bindings de dois sentidos tipados
- Use Pinia para estado compartilhado entre componentes distantes
- Evite prop drilling excessivo

### Performance
- Use `defineAsyncComponent` para code splitting
- Use `v-once` e `v-memo` com cautela em listas grandes
- Prefira `computed` sobre lógica no template
- Lazy load views no router

### Acessibilidade
- Use elementos semânticos HTML
- Adicione `aria-label` quando necessário
- Mantenha contraste adequado de cores
- Gerencie foco em modais e formulários
- Use labels associadas a inputs via `for`

### Testes
- Escreva testes para lógica crítica de composables
- Teste comportamentos, não implementação
- Mantenha testes simples e legíveis
- Use nomes descritivos para testes
- Consulte `vue-testing.md` para padrões detalhados

### Git e Commits
- Faça commits frequentes e atômicos
- Use mensagens de commit descritivas
- Um commit = uma mudança lógica
- Siga o padrão: `tipo: descrição curta` (ex: `feat: adiciona componente UserProfile`)

**Nota**: Para padrões detalhados de commits, consulte o arquivo de regras `commit.md`.

## Documentação

- Documente apenas quando necessário no `README.md`
- Mantenha README atualizado com instruções de setup
- Documente decisões arquiteturais importantes
- Inclua instruções de desenvolvimento e variáveis de ambiente

## Restrições Operacionais

- **Não inicie o servidor de desenvolvimento** (`npm run dev`, `pnpm dev`, `vite`) por conta própria — assuma que já está rodando ou peça ao usuário.
- **Não inicie serviços locais** (`docker compose up`, `docker run`, `brew services start`) sem pedido explícito.
- Valide o código antes de finalizar com `pnpm lint` e `pnpm typecheck` (ou equivalentes do projeto).
- Variáveis de ambiente públicas devem ter prefixo `VITE_`. Arquivo `.env` (a partir de `.env.example`) é obrigatório.

## Módulos Relacionados

Este arquivo contém as regras fundamentais do Vue 3. Para regras específicas, consulte:

- **vue-ui.md**: Design system, componentes reutilizáveis, estilização, acessibilidade e responsividade
- **vue-testing.md**: Vitest, Vue Test Utils, Playwright/Cypress e mocks
- **vue-checklist.md**: Checklist consolidado para verificação antes de commit
- **commit.md**: Padrões de mensagens de commit
