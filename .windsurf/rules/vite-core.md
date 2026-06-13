---
trigger: always_on
description: Regras fundamentais de desenvolvimento frontend com Vite, incluindo stack, princípios, estrutura de pastas, configuração do vite.config.ts, aliases, variáveis de ambiente, plugins, build, HMR e padrões de commits.
globs: **/*.{ts,tsx,js,jsx,vue,svelte}
---
# Regras de Desenvolvimento - Vite Core

## Stack Tecnológica

Este projeto utiliza:
- **Vite** (6.x ou superior) como build tool e servidor de desenvolvimento
- **TypeScript** para tipagem estática
- **React 19** (ou **Vue 3** / **Svelte 5**, conforme o projeto) como framework UI
- **ESLint** para linting de código
- **Vitest** para testes unitários e de integração
- **Node** >= 20 (engines no package.json)
- **pnpm** (recomendado) ou **npm** como gerenciador de pacotes
- **Path alias `@/`**: aponta para a pasta `src/` do projeto (ex.: `@/components`, `@/utils`)

> ⚠️ A stack exata de framework UI (React, Vue ou Svelte) deve ser validada no `package.json` e no `vite.config.ts` do projeto.

## Princípios Gerais

### Código Limpo e Legível
- Sempre escreva código que seja fácil de entender para você e outros desenvolvedores
- Priorize clareza sobre concisão quando necessário
- Use nomes descritivos que expliquem o propósito do código

### Consistência
- Mantenha estilo de codificação consistente em todo o projeto
- Siga os padrões estabelecidos no projeto
- Use as mesmas convenções de nomenclatura em arquivos relacionados

### Programação para Manutenção
- Escreva código pensando em quem vai mantê-lo no futuro
- Documente decisões complexas ou não óbvias
- Facilite a localização e correção de bugs

## Organização e Estrutura

### Estrutura de Pastas

Projetos Vite devem manter a pasta `src/` como raiz do código da aplicação:

```
project-root/
  ├── public/              # Assets estáticos servidos na raiz (não processados pelo Vite)
  ├── src/
  │   ├── assets/          # Assets processados pelo Vite (imagens, fonts, SVGs)
  │   ├── components/      # Componentes reutilizáveis
  │   ├── composables/     # Composables (Vue) / hooks (React/Svelte)
  │   ├── contexts/        # React Contexts
  │   ├── hooks/           # Custom hooks (React/Svelte)
  │   ├── pages/           # Páginas/rotas (quando não usar file-based routing)
  │   ├── routes/          # Configuração de rotas
  │   ├── services/        # HTTP client e services (apiClient.ts)
  │   ├── stores/          # Estado global (Pinia, Zustand, Redux Toolkit, Svelte Stores)
  │   ├── styles/          # Arquivos de estilo globais e tokens
  │   ├── types/           # Tipos TypeScript
  │   ├── utils/           # Funções utilitárias
  │   ├── App.tsx          # Componente raiz (React)
  │   ├── App.vue          # Componente raiz (Vue)
  │   ├── App.svelte       # Componente raiz (Svelte)
  │   └── main.tsx         # Ponto de entrada da aplicação
  ├── index.html           # HTML de entrada do Vite
  ├── package.json
  ├── tsconfig.json
  ├── tsconfig.app.json
  ├── tsconfig.node.json
  └── vite.config.ts
```

Path alias `@/` aponta para a pasta `src/` (ex: `@/components`, `@/utils`, `@/services`).

### Nomenclatura

#### Arquivos e Componentes
- Componentes: **PascalCase** (ex: `UserProfile.tsx`, `UserProfile.vue`, `UserProfile.svelte`)
- Composables/hooks customizados: prefixo `use` + **camelCase** (ex: `useAuth.ts`, `useLocalStorage.ts`)
- Utilitários: **camelCase** (ex: `formatDate.ts`, `apiClient.ts`)
- Types/Interfaces: **PascalCase** (ex: `User.ts`, `ApiResponse.ts`)
- Stores: **camelCase** ou **PascalCase** conforme a convenção da biblioteca (ex: `authStore.ts`, `useAuthStore.ts`)

#### Variáveis e Funções
- Variáveis e funções: **camelCase** (ex: `userName`, `getUserData`)
- Constantes: **UPPER_SNAKE_CASE** (ex: `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`)
- Componentes UI: **PascalCase** (ex: `Button`, `UserCard`)

#### Nomes Descritivos
- ✅ **Bom**: `handleSubmitForm`, `calculateTotalPrice`, `isUserAuthenticated`
- ❌ **Ruim**: `handle`, `calc`, `flag`, `x`, `data`, `temp`

### Organização do Código

#### Estrutura de Componentes
```typescript
// 1. Imports (externos, internos, types)
import { useState, useEffect } from 'react'
import type { User } from '@/types/User'
import { UserCard } from '@/components/UserCard'
import { formatDate } from '@/utils/date'

// 2. Types/Interfaces locais
interface UserProfileProps {
  user: User
  onEdit: (user: User) => void
}

// 3. Componente principal
export const UserProfile = ({ user, onEdit }: UserProfileProps) => {
  // 4. Hooks
  const [isEditing, setIsEditing] = useState(false)

  // 5. Efeitos
  useEffect(() => {
    // lógica
  }, [user.id])

  // 6. Handlers e funções auxiliares
  const handleEditClick = () => {
    setIsEditing(true)
    onEdit(user)
  }

  // 7. Render
  return (
    <div>
      <UserCard user={user} />
      <button onClick={handleEditClick}>Editar</button>
    </div>
  )
}
```

#### Funções e Rotinas
- Mantenha funções pequenas e com responsabilidade única
- Máximo de ~30 linhas por função quando possível
- Se uma função faz mais de uma coisa, divida-a
- Use funções auxiliares para lógica complexa

### Indentação e Formatação
- Use **2 espaços** para indentação (não tabs)
- Use aspas simples para strings quando possível
- Sempre inclua ponto e vírgula no final das declarações
- Mantenha linhas com máximo de 100 caracteres

### Comentários

#### Comentários de Arquivo
```typescript
/**
 * Componente: UserProfile
 *
 * Descrição: Exibe o perfil completo do usuário com informações básicas,
 * estatísticas e ações rápidas.
 */

import { ... } from '...'
```

#### Comentários no Código
- Comente apenas o **porquê**, não o **o quê**
- Comente lógica complexa ou não óbvia
- Evite comentários redundantes
- Use comentários JSDoc para funções públicas

```typescript
// ✅ Bom: Explica o porquê
// Debounce para evitar muitas requisições durante digitação
const debouncedSearch = useDebounce(searchTerm, 300)

// ❌ Ruim: Redundante
// Incrementa o contador
setCount(count + 1)
```

## Configuração do Vite

### Arquivo `vite.config.ts`

A configuração base do Vite deve incluir:
- Plugin do framework (React, Vue ou Svelte)
- Path alias `@/` para `src/`
- Configurações de build otimizadas
- Configurações de servidor de desenvolvimento

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

### Configuração TypeScript

O `tsconfig.json` deve refletir o alias `@/`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

```json
// tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

### HTML de Entrada

O Vite usa `index.html` como ponto de entrada. O script deve referenciar o arquivo principal com type="module":

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Minha Aplicação</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## Path Alias `@/`

- Use path alias `@/` para imports absolutos a partir da pasta `src/`
- Mantenha imports organizados: externos → internos → types
- Use type imports quando apropriado: `import type { User } from '@/types/User'`

```typescript
// ✅ Bom: Uso correto do alias @/
import { useState, useEffect } from 'react'
import type { User } from '@/types/User'
import { UserCard } from '@/components/UserCard'
import { formatDate } from '@/utils/date'
import { apiClient } from '@/services/apiClient'

// ❌ Ruim: Imports relativos confusos
import { UserCard } from '../../../components/UserCard'
import { formatDate } from '../../../utils/date'
```

## Variáveis de Ambiente

### Regras de Prefixo

- Variáveis públicas (acessíveis no cliente) devem ter prefixo `VITE_`
- Variáveis sem prefixo `VITE_` só estão disponíveis no Node/Vite config, não no código do cliente
- Use `.env` para variáveis padrão, `.env.local` para variáveis locais (não versionadas)
- Nunca comite arquivos `.env.local`, `.env.*.local` ou qualquer arquivo contendo secrets

```env
# ✅ Bom: Variáveis públicas com prefixo VITE_
VITE_API_URL=https://api.exemplo.com
VITE_APP_NAME=Minha Aplicação
VITE_ENABLE_ANALYTICS=true

# ❌ Ruim: Variável pública sem prefixo — não estará disponível no cliente
API_URL=https://api.exemplo.com
```

### Uso no Código

```typescript
// ✅ Bom: Acessar variável pública com import.meta.env
const apiUrl = import.meta.env.VITE_API_URL

// ❌ Ruim: Tentar acessar variável sem prefixo no cliente
const apiUrl = import.meta.env.API_URL // undefined
```

### Tipagem das Variáveis

Crie o arquivo `src/vite-env.d.ts` para tipar as variáveis de ambiente:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_ENABLE_ANALYTICS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### Boas Práticas
- Nunca exponha secrets, chaves de API privadas ou credenciais em variáveis `VITE_`
- Valide a presença de variáveis obrigatórias no startup da aplicação
- Use fallback seguro quando apropriado

```typescript
// ✅ Bom: Validação de variável obrigatória
const apiUrl = import.meta.env.VITE_API_URL
if (!apiUrl) {
  throw new Error('VITE_API_URL é obrigatória')
}

// ✅ Bom: Fallback seguro
const appName = import.meta.env.VITE_APP_NAME || 'Minha Aplicação'
```

## Plugins do Vite

### Plugins Oficiais e Recomendados

Use plugins oficiais ou bem mantidos pela comunidade:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react({
      // Fast Refresh ativado por padrão
      jsxImportSource: '@emotion/react', // quando usar Emotion
    }),
  ],
})
```

Plugins comuns por framework:
- **React**: `@vitejs/plugin-react`
- **Vue**: `@vitejs/plugin-vue`
- **Svelte**: `@sveltejs/vite-plugin-svelte`
- **TypeScript paths**: `vite-tsconfig-paths`
- **PWA**: `vite-plugin-pwa`
- **SVG como componente**: `vite-plugin-svgr` (React)
- **Compressão**: `vite-plugin-compression`
- **Inspeção**: `vite-plugin-inspect`

### Ordem dos Plugins
- Plugins oficiais do framework sempre primeiro
- Plugins de path/resolução em seguida
- Plugins de otimização de build por último

```typescript
// ✅ Bom: Ordem recomendada
plugins: [
  react(),
  viteTsconfigPaths(),
  compression(),
]
```

## Build e Otimização

### Configurações de Build

```typescript
build: {
  target: 'es2022',
  outDir: 'dist',
  assetsDir: 'assets',
  sourcemap: true,
  minify: 'terser',
  cssMinify: true,
  chunkSizeWarningLimit: 500,
  rollupOptions: {
    output: {
      manualChunks: {
        // Separa bibliotecas grandes em chunks próprios
        vendor: ['react', 'react-dom'],
        router: ['react-router-dom'],
      },
    },
  },
}
```

### Code Splitting
- Separe bibliotecas de terceiros em chunks (`vendor`)
- Separe rotas grandes usando lazy loading (`React.lazy`, `defineAsyncComponent` no Vue, `() => import()` no Svelte)
- Evite chunks muito pequenos que aumentem o número de requests

```typescript
// ✅ Bom: Lazy loading de rotas no React
import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Settings = lazy(() => import('@/pages/Settings'))

function App() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  )
}
```

### Otimização de Dependências

O Vite faz pré-bundle de dependências. Configure `optimizeDeps` quando necessário:

```typescript
optimizeDeps: {
  include: ['lodash-es', 'date-fns'],
  exclude: ['some-esm-only-package'],
}
```

### Assets
- Coloque assets estáticos em `public/` quando não precisarem ser processados
- Coloque assets processados em `src/assets/`
- Use imports para assets processados, permitindo cache busting e otimizações

```typescript
// ✅ Bom: Asset processado pelo Vite
import logo from '@/assets/logo.svg'

// ✅ Bom: Asset estático servido na raiz
<img src="/images/hero.png" alt="Hero" />

// ❌ Ruim: Referenciar assets de src/ sem import
<img src="src/assets/logo.svg" alt="Logo" />
```

## Hot Module Replacement (HMR)

- O Vite oferece HMR nativo para CSS, JS e frameworks suportados
- Não desative o HMR sem motivo claro de performance
- Aproveite o Fast Refresh do React/Vue/Svelte
- Mantenha componentes com exportações nomeadas para Fast Refresh funcionar corretamente no React

```typescript
// ✅ Bom: Exportação nomeada — Fast Refresh funciona
export function Counter() {
  return <div>0</div>
}

// ❌ Ruim: Exportação anônima pode quebrar Fast Refresh
export default function() {
  return <div>0</div>
}
```

## Padrões Específicos do Stack

### React 19
- Use hooks ao invés de classes
- Prefira componentes funcionais
- Use TypeScript para props e state
- Siga as Rules of Hooks
- Use Server Components apenas se o projeto incluir SSR/SSG integrado (ex: Nuxt, SvelteKit, React Router v7 framework mode)

### Vue 3
- Use Composition API com `<script setup lang="ts">`
- Use composables para lógica reutilizável
- Prefira `ref` e `computed` para reatividade

### Svelte 5
- Use runes (`$state`, `$derived`, `$effect`) quando disponível
- Use TypeScript com `<script lang="ts">`
- Prefira stores apenas para estado global

### TypeScript
- Use tipos estritos (`strict: true`)
- Evite `any` — prefira tipos específicos ou `unknown`
- Use type assertions com cuidado
- Defina tipos para todos os props e retornos de função

## Imports e Organização

### Ordem de Imports
```typescript
// 1. Framework/bibliotecas externas
import { useState } from 'react'

// 2. Imports do próprio framework (Vue/Svelte)
import { ref } from 'vue'

// 3. Bibliotecas de terceiros
import { z } from 'zod'

// 4. Imports internos com @/
import { Button } from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'

// 5. Type imports
import type { User } from '@/types/User'
```

## Boas Práticas Adicionais

### Estado e Hooks
- Use estado local para dados simples
- Use stores para estado global quando necessário
- Evite prop drilling — use Context (React) ou provide/inject (Vue)
- Limpe subscriptions e timers no cleanup de efeitos

### Acessibilidade
- Use elementos semânticos HTML quando apropriado
- Adicione `aria-label` quando necessário
- Mantenha contraste adequado de cores
- Teste com leitores de tela
- Garanta navegação por teclado em componentes interativos

### Testes
- Escreva testes para lógica crítica
- Teste comportamentos, não implementação
- Mantenha testes simples e legíveis
- Use nomes descritivos para testes
- Configure Vitest no `vite.config.ts`

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
- Inclua instruções de desenvolvimento (`pnpm dev`, `pnpm build`, `pnpm preview`)

## Restrições Operacionais

- **Não inicie o servidor de desenvolvimento** (`pnpm dev`, `vite`) por conta própria — assuma que já está rodando ou peça ao usuário. Antes de declarar pronto, valide com `pnpm lint` e `pnpm typecheck` (ou `tsc --noEmit`).
- **Não inicie serviços locais** (`docker compose up`, `docker run`, `brew services start`) sem pedido explícito.
- Não versione arquivos `.env.local`, `dist/` ou `.vite/`.
- Sempre valide o build com `pnpm build` antes de entregar uma feature significativa.

## Módulos Relacionados

Este arquivo contém as regras fundamentais de projetos Vite. Para regras específicas, consulte:

- **vite-checklist.md**: Checklist consolidado para verificação antes de commit
- **vue-core.md** e **vue-ui.md**: quando o projeto Vite usar Vue
- **nextjs-ui.md**: referência de UI React quando o projeto Vite usar React
- **security-core.md**: validação de dados, proteção contra XSS e segurança frontend
