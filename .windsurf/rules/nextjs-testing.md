---
trigger: model_decision
description: Regras para testes em projetos Next.js: Vitest/Jest, React Testing Library, Playwright para E2E, testes de componentes e páginas, e mocks de fetch.
globs: **/*.{ts,tsx}
---
# Regras de Desenvolvimento - Next.js Testing

## Stack de Testes

Este projeto utiliza:

- **Vitest** ou **Jest** como runner de testes unitários e de integração
- **React Testing Library** para testes de componentes React
- **Playwright** para testes end-to-end (E2E)
- **MSW (Mock Service Worker)** ou mocks manuais para simular requisições HTTP
- **@testing-library/user-event** para simular interações do usuário

## Configuração Básica

### Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Jest

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

### Setup de Testes

```typescript
// src/test/setup.ts (Vitest)
import '@testing-library/jest-dom/vitest'

// jest.setup.js (Jest)
import '@testing-library/jest-dom'
```

## Testes de Componentes

- Teste comportamentos, não implementação
- Foque no que o usuário vê e interage
- Evite testar estados internos ou métodos de componente
- Use `screen` para consultar elementos
- Prefira consultas semânticas (`getByRole`, `getByLabelText`) sobre `getByTestId`

```tsx
// components/ui/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

const user = userEvent.setup()

describe('Button', () => {
  it('renderiza o texto do botão', () => {
    render(<Button>Clique aqui</Button>)

    expect(screen.getByRole('button', { name: /clique aqui/i })).toBeInTheDocument()
  })

  it('desabilita o botão quando isLoading é true', () => {
    render(<Button isLoading>Clique aqui</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('chama onClick ao clicar', async () => {
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Clique aqui</Button>)

    await user.click(screen.getByRole('button', { name: /clique aqui/i }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Testes de Páginas

- Páginas Server Components podem ser testadas como unidades ou via integração
- Prefira testar a lógica de renderização e os dados esperados
- Mock serviços e dados de forma consistente

```tsx
// app/dashboard/page.test.tsx
import { render, screen } from '@testing-library/react'
import DashboardPage from './page'
import * as userService from '@/services/userService'

vi.mock('@/services/userService')

describe('DashboardPage', () => {
  it('renderiza o nome do usuário', async () => {
    vi.mocked(userService.getCurrentUser).mockResolvedValue({
      id: '1',
      name: 'Maria Silva',
      email: 'maria@exemplo.com',
    })

    const page = await DashboardPage()
    render(page)

    expect(screen.getByText('Bem-vinda, Maria Silva')).toBeInTheDocument()
  })
})
```

## Mocks de Fetch

### Mock Manual com `global.fetch`

```typescript
// services/apiClient.test.ts
import { getUsers } from './apiClient'

describe('getUsers', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('retorna lista de usuários', async () => {
    const mockUsers = [
      { id: '1', name: 'João' },
      { id: '2', name: 'Ana' },
    ]

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    } as Response)

    const result = await getUsers()

    expect(result).toEqual(mockUsers)
    expect(global.fetch).toHaveBeenCalledWith('/api/users')
  })

  it('lança erro quando a resposta não é ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response)

    await expect(getUsers()).rejects.toThrow('Erro ao buscar usuários')
  })
})
```

### Mock com MSW

```typescript
// src/test/server.ts
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'João' },
      { id: '2', name: 'Ana' },
    ])
  })
)

// src/test/setup.ts
import { server } from './server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Testes de Hooks

- Use `@testing-library/react-hooks` (React < 18) ou `renderHook` do `@testing-library/react` (React 18+)
- Teste o comportamento exposto pelo hook, não a implementação interna

```typescript
// hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('inicia com valor padrão 0', () => {
    const { result } = renderHook(() => useCounter())

    expect(result.current.count).toBe(0)
  })

  it('incrementa o contador', () => {
    const { result } = renderHook(() => useCounter())

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })
})
```

## Testes End-to-End com Playwright

- Teste fluxos críticos do usuário
- Mantenha testes independentes entre si
- Use `test.describe` para agrupar cenários relacionados
- Use fixtures e Page Object Model para reuso

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Fluxo de Login', () => {
  test('usuário faz login com credenciais válidas', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('E-mail').fill('usuario@exemplo.com')
    await page.getByLabel('Senha').fill('senha-segura')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Bem-vindo de volta')).toBeVisible()
  })

  test('exibe erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('E-mail').fill('invalido@exemplo.com')
    await page.getByLabel('Senha').fill('errada')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByText('Credenciais inválidas')).toBeVisible()
  })
})
```

```typescript
// e2e/fixtures.ts
import { test as base } from '@playwright/test'

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.getByLabel('E-mail').fill('usuario@exemplo.com')
    await page.getByLabel('Senha').fill('senha-segura')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('/dashboard')

    await use(page)
  },
})
```

## Boas Práticas

- ✅ Teste comportamentos, não implementação
- ✅ Use nomes descritivos para testes (`it('exibe mensagem de erro quando...')`)
- ✅ Mantenha testes isolados e determinísticos
- ✅ Limpe mocks e estado entre testes
- ✅ Agrupe testes relacionados com `describe`
- ❌ Não teste bibliotecas de terceiros
- ❌ Não ignore testes quebrados com `.skip` sem justificativa documentada

## Cobertura de Testes

- Priorize testes em:
  - Lógica de negócio crítica
  - Fluxos de autenticação e autorização
  - Formulários e validações
  - Integrações com APIs
- Cobertura não é o único objetivo — qualidade dos testes é mais importante

## Módulos Relacionados

Para regras relacionadas, consulte:

- **nextjs-core.md**: Princípios fundamentais, estrutura e Server/Client Components
- **nextjs-ui.md**: Bibliotecas de UI, componentes, acessibilidade e responsividade
- **nextjs-checklist.md**: Checklist consolidado para verificação antes de commit
