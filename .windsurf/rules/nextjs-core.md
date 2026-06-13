---
trigger: always_on
description: Regras fundamentais de desenvolvimento Next.js: stack tecnológica, princípios, estrutura de pastas, nomenclatura, formatação, App Router, Server Components, path alias e variáveis de ambiente.
globs: **/*.{ts,tsx}
---
# Regras de Desenvolvimento - Next.js Core

## Stack Tecnológica

Este projeto utiliza:

- **Next.js** (14.x ou superior) como framework React full-stack
- **React** (18.x ou 19.x) como biblioteca de interface
- **TypeScript** com modo estrito (`strict: true`)
- **ESLint** para linting e padronização de código
- **Path alias `@/`** apontando para a raiz do projeto (`./src` ou `./`, conforme configurado em `tsconfig.json`)
- **Node.js** >= 20 (definido em `engines` no `package.json`)

Ferramentas complementares comuns (conforme adotadas no projeto):

- **Tailwind CSS** ou outra solução de estilização
- **shadcn/ui**, **Material UI** ou outra biblioteca de componentes
- **React Hook Form** para formulários
- **Zod** para validação de schemas
- **TanStack Query** para estado servidor e cache
- **Vitest** ou **Jest** para testes unitários
- **Playwright** para testes end-to-end

## Princípios Gerais

### Código Limpo e Legível

- Escreva código que seja fácil de entender para você e para outros desenvolvedores
- Prefira clareza sobre concisão quando necessário
- Use nomes descritivos que expliquem o propósito do código
- Evite abreviações obscuras ou siglas sem contexto

### Consistência

- Mantenha estilo de codificação consistente em todo o projeto
- Siga os padrões estabelecidos nas regras e no código existente
- Use as mesmas convenções de nomenclatura em arquivos relacionados

### Programação para Manutenção

- Escreva código pensando em quem vai mantê-lo no futuro
- Documente decisões complexas ou não óbvias
- Facilite a localização e correção de bugs
- Evite soluções engenhosas difíceis de ler

## Organização e Estrutura

### Estrutura de Pastas

Prefira a seguinte organização base. Ajuste conforme a complexidade do projeto, mas mantenha a coerência:

```
.
├── app/                    # App Router (Next.js 13+) — rotas, layouts e páginas
│   ├── (marketing)/        # Route groups (sem segmento de URL)
│   ├── api/                # Route Handlers (API endpoints)
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── loading.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── error.tsx
├── components/             # Componentes React reutilizáveis
│   ├── ui/                 # Componentes de biblioteca de UI (Button, Input, Card)
│   ├── forms/              # Componentes específicos de formulários
│   └── layout/             # Componentes de layout (Header, Sidebar, Footer)
├── hooks/                  # Custom hooks
├── lib/                    # Configurações e utilitários de bibliotecas
├── providers/              # Providers React (ThemeProvider, QueryProvider)
├── schemas/                # Schemas Zod para validação
├── services/               # Funções de comunicação com APIs externas
├── styles/                 # Arquivos globais de estilo (CSS, Tailwind config)
├── types/                  # Tipos e interfaces TypeScript globais
└── utils/                  # Funções utilitárias puras
```

#### Quando usar `src/`

- ✅ **Use `src/`** se o projeto tiver muitos arquivos de configuração na raiz ou se a equipe preferir separar código-fonte de configuração
- ✅ **Não use `src/`** se o projeto for pequeno e a raiz já estiver organizada
- ❌ **Não misture**: escolha uma convenção e mantenha-a

### Nomenclatura

#### Arquivos

- Componentes React: **PascalCase** (ex: `UserProfile.tsx`, `NavigationBar.tsx`)
- Hooks customizados: prefixo `use` + **camelCase** (ex: `useAuth.ts`, `useLocalStorage.ts`)
- Utilitários: **camelCase** (ex: `formatDate.ts`, `apiClient.ts`)
- Types/Interfaces: **PascalCase** (ex: `User.ts`, `ApiResponse.ts`)
- Arquivos de página do Next.js: **lowercase** (`page.tsx`, `layout.tsx`, `loading.tsx`)
- Arquivos de API: **lowercase** (`route.ts`)

#### Variáveis, Funções e Constantes

- Variáveis e funções: **camelCase** (ex: `userName`, `getUserData`)
- Constantes globais: **UPPER_SNAKE_CASE** (ex: `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`)
- Componentes React: **PascalCase** (ex: `Button`, `UserCard`)
- Booleanos: use prefixos como `is`, `has`, `should`, `can` (ex: `isLoading`, `hasError`)

#### Nomes Descritivos

- ✅ **Bom**: `handleSubmitForm`, `calculateTotalPrice`, `isUserAuthenticated`
- ❌ **Ruim**: `handle`, `calc`, `flag`, `x`, `data`, `temp`

### Organização do Código

#### Estrutura de Componentes React

```typescript
// 1. Imports (React/Next, bibliotecas, internos, types)
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import type { User } from '@/types/User'

// 2. Types/Interfaces locais
interface UserProfileProps {
  user: User
  onUpdate: (user: User) => void
}

// 3. Componente principal
export const UserProfile = ({ user, onUpdate }: UserProfileProps) => {
  // 4. Hooks
  const [isEditing, setIsEditing] = useState(false)

  // 5. Efeitos
  useEffect(() => {
    // lógica de efeito
  }, [user.id])

  // 6. Handlers e funções auxiliares
  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev)
  }

  // 7. Render
  return (
    <div>
      <h1>{user.name}</h1>
      <Button onClick={handleToggleEdit}>
        {isEditing ? 'Cancelar' : 'Editar'}
      </Button>
    </div>
  )
}
```

#### Funções e Rotinas

- Mantenha funções pequenas e com responsabilidade única
- Limite funções a aproximadamente 30 linhas quando possível
- Se uma função faz mais de uma coisa, divida-a
- Use funções auxiliares para lógica complexa

## Formatação

- Use **2 espaços** para indentação (não tabs)
- Use aspas simples para strings quando possível
- Sempre inclua ponto e vírgula no final das declarações
- Mantenha linhas com máximo de 100 caracteres
- Use ESLint como ferramenta única de padronização
- **Sem Prettier** se o projeto optar por ESLint puro — não configure ambos conflitando

```json
// tsconfig.json — exemplo mínimo recomendado
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Comentários

### Comentários de Arquivo

```typescript
/**
 * Componente: UserProfile
 *
 * Descrição: Exibe o perfil completo do usuário com informações básicas,
 * estatísticas e ações rápidas.
 */

import { ... } from '...'
```

### Comentários no Código

- Comente apenas o **porquê**, não o **o quê**
- Comente lógica complexa ou não óbvia
- Evite comentários redundantes
- Use comentários JSDoc para funções públicas e utilitários exportados

```typescript
// ✅ Bom: Explica o porquê
// Debounce para evitar muitas requisições durante digitação
const debouncedSearch = useDebounce(searchTerm, 300)

// ❌ Ruim: Redundante
// Incrementa o contador
setCount(count + 1)
```

## App Router e Componentes

### Server Components por Padrão

- Todos os componentes no App Router são **Server Components por padrão**
- Use Server Components sempre que possível para reduzir JavaScript no cliente
- Faça fetch de dados diretamente em Server Components quando apropriado
- Acesse bancos de dados, APIs internas e variáveis de ambiente privadas apenas em Server Components

```typescript
// ✅ Bom: Server Component buscando dados no servidor
import { getUserById } from '@/services/userService'

interface UserPageProps {
  params: Promise<{ id: string }>
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params
  const user = await getUserById(id)

  return (
    <main>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </main>
  )
}
```

### Client Components Apenas Quando Necessário

- Adicione `'use client'` apenas quando o componente precisar de:
  - Hooks do React (`useState`, `useEffect`, `useContext`)
  - Eventos do browser (`onClick`, `onSubmit`)
  - APIs do browser (`localStorage`, `sessionStorage`, `window`, `document`)
  - Bibliotecas que dependam do ambiente cliente

```typescript
// ✅ Bom: Client Component com interatividade
'use client'

import { useState } from 'react'

export const LikeButton = () => {
  const [count, setCount] = useState(0)

  return (
    <button
      type="button"
      onClick={() => setCount((prev) => prev + 1)}
      aria-label="Curtir"
    >
      ❤️ {count}
    </button>
  )
}
```

```typescript
// ❌ Ruim: Client Component sem necessidade
'use client'

export const StaticHeader = () => {
  return <header>Título da página</header>
}
```

### Layouts e Loading

- Use `layout.tsx` para estruturas compartilhadas entre rotas
- Use `loading.tsx` para estados de carregamento automáticos
- Use `error.tsx` para tratamento de erros por segmento
- Use `not-found.tsx` para páginas 404 customizadas

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64">Menu</aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
```

## Path Alias

- Use path alias `@/` para imports absolutos
- Mantenha imports organizados: externos → internos → types
- Use type imports quando apropriado: `import type { User } from '@/types/User'`

```typescript
// ✅ Bom: Organização de imports
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/date'
import type { User } from '@/types/User'

// ❌ Ruim: Imports desorganizados
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { formatDate } from '@/utils/date'
import Image from 'next/image'
```

## Variáveis de Ambiente

- Variáveis de ambiente privadas (servidor): sem prefixo especial
  - Exemplo: `DATABASE_URL`, `API_SECRET`
- Variáveis de ambiente públicas (cliente): prefixo obrigatório `NEXT_PUBLIC_`
  - Exemplo: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_NAME`
- ❌ Nunca exponha secrets, chaves de API privadas ou credenciais com prefixo `NEXT_PUBLIC_`
- Valide variáveis de ambiente em tempo de build quando possível

```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.exemplo.com
NEXT_PUBLIC_APP_NAME=MeuApp

# Apenas servidor
DATABASE_URL=postgresql://...
API_SECRET=chave-secreta
```

```typescript
// ✅ Bom: Uso correto de variáveis públicas e privadas
const apiUrl = process.env.NEXT_PUBLIC_API_URL
const dbUrl = process.env.DATABASE_URL // apenas Server Components
```

## Estado e Hooks

- Use `useState` para estado local simples
- Use `useReducer` para estado complexo
- Use Context API para estado global quando necessário
- Evite prop drilling — use Context ou bibliotecas de state management
- Limpe subscriptions e timers no cleanup do `useEffect`

```typescript
// ✅ Bom: Cleanup de subscription
useEffect(() => {
  const controller = new AbortController()

  fetch('/api/data', { signal: controller.signal })
    .then((res) => res.json())
    .then(setData)

  return () => controller.abort()
}, [])
```

## Acessibilidade

- Use elementos semânticos HTML (`header`, `nav`, `main`, `section`, `footer`)
- Adicione `aria-label` e `aria-describedby` quando necessário
- Mantenha contraste adequado de cores
- Garanta navegação por teclado
- Use componentes de bibliotecas acessíveis quando disponíveis

## Git e Commits

- Faça commits frequentes e atômicos
- Use mensagens de commit descritivas
- Um commit = uma mudança lógica
- Siga o padrão: `tipo: descrição curta`
  - Exemplo: `feat: adiciona componente UserProfile`
  - Exemplo: `fix: corrige cache invalidado após login`

Para padrões detalhados de commits, consulte o arquivo de regras `commit.md` do projeto.

## Documentação

- Mantenha o `README.md` atualizado com instruções de setup e desenvolvimento
- Documente decisões arquiteturais importantes
- Evite documentar o óbvio no código

## Restrições Operacionais

- **Não inicie o servidor de desenvolvimento** (`pnpm dev`, `next dev`, `npm run dev`) por conta própria — assuma que já está rodando ou peça ao usuário
- **Não inicie serviços locais** (`docker compose up`, `docker run`, `brew services start`) sem pedido explícito
- Valide alterações com `pnpm lint` e `pnpm typecheck` antes de finalizar
- Variáveis de ambiente públicas devem ter prefixo `NEXT_PUBLIC_`

## Módulos Relacionados

Este arquivo contém as regras fundamentais do Next.js. Para regras específicas, consulte:

- **nextjs-ui.md**: Bibliotecas de UI, tokens de cor, componentes, responsividade e acessibilidade
- **nextjs-testing.md**: Vitest/Jest, React Testing Library, Playwright e mocks
- **nextjs-checklist.md**: Checklist consolidado para verificação antes de commit
