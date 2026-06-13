---
trigger: model_decision
description: Regras para interface e componentes Next.js: escolha de biblioteca de UI, tokens de cor, acessibilidade, responsividade, otimização de imagens e links, e uso correto de Server/Client Components.
globs: **/*.{ts,tsx}
---
# Regras de Desenvolvimento - Next.js UI

## Escolha de Biblioteca de UI

Escolha uma biblioteca de UI no início do projeto e mantenha a consistência. As opções mais comuns são:

### shadcn/ui + Tailwind CSS

- ✅ Recomendada para projetos novos com design system customizado
- Componentes desacoplados e copiados para o projeto (em `@/components/ui/`)
- Total controle sobre estilos via Tailwind
- Baseada em Radix UI, com acessibilidade embutida

### Material UI (MUI)

- ✅ Recomendada para produtividade rápida e design system maduro
- Componentes prontos e bem documentados
- Sistema de tema robusto via `ThemeProvider`
- Grande ecossistema de ícones e componentes

### Tailwind CSS Puro

- ✅ Recomendada para projetos leves e com necessidade de controle total visual
- Classes utilitárias diretamente no JSX
- Bundle pequeno quando configurado com purge
- Exige mais disciplina para manter consistência

### Regra Geral

- ❌ Não misture múltiplas bibliotecas de UI no mesmo projeto sem justificativa
- ❌ Não crie componentes do zero se a biblioteca já oferece uma solução acessível
- ✅ Padronize uma única abordagem e documente a decisão

## Tokens de Cor

A fonte única de cor do projeto deve ser o sistema de tokens. Isso garante consistência, contraste e facilidade de manutenção.

### Com Tailwind CSS

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}

export default config
```

```tsx
// ✅ Bom: Uso de tokens do Tailwind
<button className="bg-brand-600 text-white hover:bg-brand-700">
  Enviar
</button>

// ❌ Ruim: Cores hexadecimais espalhadas no código
<button className="bg-[#2563eb] text-white hover:bg-[#1d4ed8]">
  Enviar
</button>
```

### Com Material UI

```typescript
// theme.ts
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed',
    },
  },
})
```

```tsx
// ✅ Bom: Usando tema do MUI
<Button variant="contained" color="primary">
  Enviar
</Button>

// ❌ Ruim: Cor hardcoded
<Button sx={{ backgroundColor: '#2563eb' }}>
  Enviar
</Button>
```

### Princípios de Cor

- ✅ Use tokens semânticos: `primary`, `secondary`, `error`, `warning`, `success`, `info`
- ✅ Defina tokens para superfícies, texto, bordas e estados de foco
- ❌ Não use hex, rgb ou rgba cru em componentes de UI
- ✅ Teste contraste em modo claro e escuro

## Componentes

### Componentes de UI Base

Mantenha componentes base encapsulados e reutilizáveis. Eles devem ser simples, configuráveis via props e acessíveis.

```tsx
// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', isLoading, children, ...props }, ref) => {
    const baseStyles = 'px-4 py-2 rounded font-medium transition-colors'
    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? 'Carregando...' : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

### Composição de Componentes

- ✅ Prefira composição sobre props excessivas
- ✅ Use `children` para conteúdo flexível
- ❌ Evite componentes com dezenas de props booleanas

```tsx
// ✅ Bom: Composição clara
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Conteúdo aqui</CardContent>
  <CardFooter>
    <Button>Salvar</Button>
  </CardFooter>
</Card>

// ❌ Ruim: Muitas props acopladas
<Card
  title="Título"
  content="Conteúdo aqui"
  showFooter
  footerButtonText="Salvar"
/>
```

## Acessibilidade

- Use elementos semânticos HTML (`button`, `a`, `label`, `main`, `nav`)
- Garanta foco visível em todos os elementos interativos
- Forneça textos alternativos para imagens
- Use `aria-label` quando o texto visual não for suficiente
- Associe labels a inputs via `htmlFor` + `id`
- Não remova foco com `outline: none` sem substituir por estilo visível

```tsx
// ✅ Bom: Input acessível
<label htmlFor="email">E-mail</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={hasError}
/>
{hasError && <span id="email-error">E-mail inválido</span>}

// ❌ Ruim: Input sem label associado
<input type="email" placeholder="E-mail" />
```

## Responsividade

- Use breakpoints consistentes: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Com Tailwind: use classes responsivas (`md:flex`, `lg:grid-cols-3`)
- Com MUI: use `sx` com objetos de breakpoints ou `useMediaQuery`
- Evite larguras fixas em pixels quando possível
- Teste layouts em 320px, 768px, 1024px e 1440px

```tsx
// ✅ Bom: Layout responsivo com Tailwind
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {items.map((item) => (
    <Card key={item.id} data={item} />
  ))}
</div>

// ❌ Ruim: Layout fixo
<div className="grid grid-cols-3 gap-4">
  {items.map((item) => (
    <Card key={item.id} data={item} />
  ))}
</div>
```

```tsx
// ✅ Bom: Breakpoints no sx do MUI
<Box
  sx={{
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, 1fr)',
      lg: 'repeat(3, 1fr)',
    },
    gap: 2,
  }}
>
  {items.map((item) => (
    <Card key={item.id} data={item} />
  ))}
</Box>
```

## Server Components vs Client Components na UI

- Componentes puramente visuais e estáticos devem ser Server Components
- Componentes interativos (com estado, efeitos, eventos) devem ser Client Components
- Importe componentes cliente dentro de componentes servidor quando necessário

```tsx
// app/page.tsx — Server Component
import { HeroSection } from '@/components/sections/HeroSection'
import { NewsletterForm } from '@/components/forms/NewsletterForm'

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <NewsletterForm /> {/* Client Component */}
    </main>
  )
}
```

```tsx
// components/forms/NewsletterForm.tsx — Client Component
'use client'

import { useState } from 'react'

export const NewsletterForm = () => {
  const [email, setEmail] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // lógica de envio
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Seu e-mail"
      />
      <button type="submit">Assinar</button>
    </form>
  )
}
```

## Imagens com `next/image`

- Sempre use `next/image` para otimização automática de imagens
- Forneça `alt` descritivo ou `alt=""` para imagens decorativas
- Use `width` e `height` para evitar layout shift
- Use `priority` apenas para imagens acima da dobra (LCP)
- Prefira formatos modernos (WebP, AVIF)

```tsx
// ✅ Bom: Imagem otimizada
import Image from 'next/image'

export const Hero = () => {
  return (
    <Image
      src="/images/hero.jpg"
      alt="Pessoa usando o aplicativo em um smartphone"
      width={1200}
      height={600}
      priority
    />
  )
}

// ❌ Ruim: Imagem com img padrão
<img src="/images/hero.jpg" alt="Hero" />
```

## Links com `next/link`

- Use `next/link` para navegação interna
- Prefira links semânticos com `<a>` interno quando necessário
- Use `prefetch` com critério (padrão true em viewport)

```tsx
// ✅ Bom: Link interno com Next.js
import Link from 'next/link'

export const NavLink = () => {
  return (
    <Link href="/dashboard" className="text-blue-600 hover:underline">
      Dashboard
    </Link>
  )
}

// ❌ Ruim: Link com tag <a> para navegação interna
<a href="/dashboard">Dashboard</a>
```

## Animações e Transições

- Use animações com propósito, não apenas decorativas
- Respeite `prefers-reduced-motion`
- Evite animações que causem layout shift

```css
/* ✅ Bom: Respeita preferência do usuário */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Boas Práticas

- ✅ Mantenha componentes pequenos e com responsabilidade única
- ✅ Extraia lógica para hooks customizados quando crescer
- ✅ Reutilize componentes de UI base em vez de duplicar estilos
- ✅ Documente props complexas com JSDoc
- ❌ Não escreva estilos inline com `style={{}}` em produção
- ❌ Não ignore warnings de acessibilidade do navegador ou do linter

## Módulos Relacionados

Para regras relacionadas, consulte:

- **nextjs-core.md**: Princípios fundamentais, estrutura, nomenclatura e Server/Client Components
- **nextjs-testing.md**: Testes de componentes e páginas
- **nextjs-checklist.md**: Checklist consolidado para verificação antes de commit
