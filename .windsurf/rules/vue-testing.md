---
trigger: always_on
description: Regras de testes para projetos Vue 3 - Vitest, Vue Test Utils, testes E2E com Playwright/Cypress e mocks de stores e router.
globs: **/*.{vue,ts,js}
---
# Regras de Desenvolvimento - Vue Testing

## Stack de Testes

Este projeto utiliza:
- **Vitest** como runner de testes unitários
- **Vue Test Utils** para montar e interagir com componentes Vue
- **@vue/test-utils** com `mount` e `shallowMount`
- **happy-dom** ou **jsdom** como ambiente DOM
- **Playwright** ou **Cypress** para testes end-to-end
- **Pinia** com `createPinia` e `setActivePinia` para testes de stores

## Princípios de Testes

### Teste Comportamento, Não Implementação
- Escreva testes que verifiquem o que o usuário vê e faz
- Evite testar detalhes internos de implementação
- Foque em entradas e saídas visíveis

```typescript
// ✅ Bom: testa comportamento visível
it('exibe mensagem de erro quando email é inválido', async () => {
  const wrapper = mount(LoginForm)

  await wrapper.find('input[type="email"]').setValue('email-invalido')
  await wrapper.find('form').trigger('submit')

  expect(wrapper.text()).toContain('Email inválido')
})

// ❌ Ruim: testa detalhe interno
it('define hasError como true quando email é inválido', () => {
  const wrapper = mount(LoginForm)
  wrapper.vm.hasError = true
  expect(wrapper.vm.hasError).toBe(true)
})
```

### Testes Simples e Legíveis
- Mantenha testes pequenos e diretos
- Um teste deve verificar uma responsabilidade
- Use nomes descritivos que expliquem o cenário

```typescript
// ✅ Bom
it('desabilita o botão de envio enquanto a store está carregando', async () => {
  // ...
})

// ❌ Ruim
it('funciona', () => {
  // ...
})
```

### Independência
- Cada teste deve ser independente
- Limpe estado entre testes
- Não dependa da ordem de execução

## Estrutura de Arquivos de Teste

```
src/
  ├── components/
  │     ├── common/
  │     │     ├── BaseButton.vue
  │     │     └── __tests__/
  │     │           └── BaseButton.spec.ts
  │     └── features/
  │           ├── UserCard.vue
  │           └── __tests__/
  │                 └── UserCard.spec.ts
  ├── composables/
  │     ├── useAuth.ts
  │     └── __tests__/
  │           └── useAuth.spec.ts
  ├── stores/
  │     ├── useAuthStore.ts
  │     └── __tests__/
  │           └── useAuthStore.spec.ts
  ├── views/
  │     ├── HomeView.vue
  │     └── __tests__/
  │           └── HomeView.spec.ts
  └── e2e/
        └── login.spec.ts
```

## Testes de Composables

```typescript
// src/composables/__tests__/useCounter.spec.ts
import { describe, it, expect } from 'vitest'
import { useCounter } from '../useCounter'

describe('useCounter', () => {
  it('inicia com valor padrão 0', () => {
    const { count } = useCounter()
    expect(count.value).toBe(0)
  })

  it('incrementa o contador', () => {
    const { count, increment } = useCounter()
    increment()
    expect(count.value).toBe(1)
  })

  it('respeita valor inicial customizado', () => {
    const { count } = useCounter(10)
    expect(count.value).toBe(10)
  })
})
```

## Testes de Stores (Pinia)

```typescript
// src/stores/__tests__/useAuthStore.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../useAuthStore'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('inicia não autenticado', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
  })

  it('atualiza usuário ao fazer login', async () => {
    const store = useAuthStore()
    await store.login('user@example.com', 'password')

    expect(store.isAuthenticated).toBe(true)
    expect(store.user?.email).toBe('user@example.com')
  })
})
```

## Testes de Componentes

### Montagem Básica

```typescript
// src/components/common/__tests__/BaseButton.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '../BaseButton.vue'

describe('BaseButton', () => {
  it('renderiza o texto do slot', () => {
    const wrapper = mount(BaseButton, {
      slots: {
        default: 'Clique aqui',
      },
    })

    expect(wrapper.text()).toBe('Clique aqui')
  })

  it('emite evento click ao ser clicado', async () => {
    const wrapper = mount(BaseButton)

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('desabilita o botão quando disabled é true', () => {
    const wrapper = mount(BaseButton, {
      props: { disabled: true },
    })

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
})
```

### Mocks de Stores no Componente

```typescript
// src/components/features/__tests__/UserProfile.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UserProfile from '../UserProfile.vue'
import { useUserStore } from '@/stores/useUserStore'

describe('UserProfile', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('exibe nome do usuário da store', () => {
    const store = useUserStore()
    store.user = { id: '1', name: 'Maria Silva', email: 'maria@example.com' }

    const wrapper = mount(UserProfile)

    expect(wrapper.text()).toContain('Maria Silva')
  })
})
```

### Mocks de Vue Router

```typescript
// src/views/__tests__/DashboardView.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../DashboardView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: { template: '<div />' } },
    { path: '/dashboard', name: 'Dashboard', component: DashboardView },
  ],
})

describe('DashboardView', () => {
  it('navega para home ao clicar em voltar', async () => {
    await router.push('/dashboard')
    await router.isReady()

    const wrapper = mount(DashboardView, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.find('[data-testid="back-button"]').trigger('click')

    expect(router.currentRoute.value.path).toBe('/')
  })
})
```

### Mocks de Serviços HTTP

```typescript
// src/services/__mocks__/userService.ts
import { vi } from 'vitest'

export const userService = {
  getUser: vi.fn(),
  updateUser: vi.fn(),
}
```

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import UserProfile from '@/components/features/UserProfile.vue'
import { userService } from '@/services/userService'

vi.mock('@/services/userService')

describe('UserProfile', () => {
  it('busca e exibe dados do usuário', async () => {
    userService.getUser.mockResolvedValue({
      id: '1',
      name: 'João Souza',
      email: 'joao@example.com',
    })

    const wrapper = mount(UserProfile, {
      props: { userId: '1' },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('João Souza')
  })
})
```

## Testes E2E

### Playwright

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test('usuário pode fazer login', async ({ page }) => {
  await page.goto('/login')

  await page.fill('input[type="email"]', 'user@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Dashboard')
})
```

### Cypress

```typescript
// cypress/e2e/login.cy.ts
describe('Login', () => {
  it('redireciona para dashboard após login', () => {
    cy.visit('/login')

    cy.get('input[type="email"]').type('user@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/dashboard')
    cy.contains('h1', 'Dashboard')
  })
})
```

## Seletores em Testes

- Use `data-testid` para seletores estáveis
- Evite seletores baseados em classes CSS ou estrutura DOM
- Use seletores de papel/ARIA quando apropriado

```vue
<!-- ✅ Bom -->
<button data-testid="submit-button" type="submit">Enviar</button>

<!-- ❌ Ruim: depende de classe que pode mudar -->
<button class="btn btn-primary" type="submit">Enviar</button>
```

```typescript
await wrapper.find('[data-testid="submit-button"]').trigger('click')
```

## Cobertura

- Foque em lógica crítica: composables, stores, componentes complexos
- Não persiga cobertura 100% por cobertura
- Teste casos de sucesso e erro
- Teste estados de loading e vazio

## Execução de Testes

- Use `pnpm test` para rodar todos os testes
- Use `pnpm test:unit` para testes unitários
- Use `pnpm test:e2e` para testes E2E
- Use `pnpm test -- --watch` durante desenvolvimento
- Não rode testes E2E automaticamente sem confirmação do ambiente

## Módulos Relacionados

- **vue-core.md**: Stack, estrutura de pastas, Composition API, Pinia, Vue Router
- **vue-ui.md**: Design system, componentes reutilizáveis, acessibilidade
- **vue-checklist.md**: Checklist consolidado para verificação antes de commit
