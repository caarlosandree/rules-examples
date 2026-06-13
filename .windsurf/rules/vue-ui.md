---
trigger: always_on
description: Regras de UI/UX para projetos Vue 3 - design system, componentes reutilizáveis, props/emits, slots, acessibilidade, responsividade e estilização.
globs: **/*.{vue,ts,js}
---
# Regras de Desenvolvimento - Vue UI

## Design System

### Princípios de UI
- Mantenha consistência visual em toda a aplicação
- Reutilize componentes em vez de recriar estilos
- Siga as decisões do design system definido no projeto
- Use tokens de design para cores, espaçamento, tipografia e sombras
- Evite valores hardcoded de cores e espaçamento

### Tokens de Design
- Centralize tokens em arquivos de configuração (ex: `src/theme/tokens.ts` ou `tailwind.config.ts`)
- Use tokens semânticos (`primary`, `error`, `surface`) em vez de valores hexadecimais crus
- Nomeie tokens de forma previsível e reutilizável

```typescript
// ✅ Bom: tokens semânticos
export const tokens = {
  colors: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    error: '#ef4444',
    surface: '#ffffff',
    text: '#1f2937',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
}

// ❌ Ruim: cores hexadecimais espalhadas pelos componentes
<style scoped>
.button {
  background-color: #3b82f6;
}
</style>
```

## Componentes Reutilizáveis

### Base Components
- Crie componentes base genéricos na pasta `src/components/common/`
- Componentes base devem ser simples, configuráveis e sem lógica de negócio
- Exemplos: `BaseButton.vue`, `BaseInput.vue`, `BaseModal.vue`, `BaseCard.vue`
- Sempre exponha props e eventos necessários para flexibilidade

```vue
<!-- BaseButton.vue -->
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :class="['base-button', `base-button--${variant}`, `base-button--${size}`]"
    :disabled="disabled || loading"
    @click="emit('click', $event)"
  >
    <span v-if="loading" class="base-button__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>
```

### Feature Components
- Componentes específicos de domínio ficam em `src/components/features/`
- Eles combinam componentes base com lógica de negócio
- Exemplos: `UserCard.vue`, `OrderList.vue`, `PaymentForm.vue`

### Composição com Slots
- Use slots para tornar componentes flexíveis
- Prefira slots nomeados quando houver múltiplas regiões configuráveis
- Use `slot props` para expor dados internos ao consumidor

```vue
<!-- BaseCard.vue -->
<template>
  <article class="base-card">
    <header v-if="$slots.header" class="base-card__header">
      <slot name="header" />
    </header>

    <div class="base-card__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </footer>
  </article>
</template>
```

```vue
<!-- Uso do BaseCard.vue -->
<BaseCard>
  <template #header>
    <h2>Resumo do Pedido</h2>
  </template>

  <p>Total: R$ 199,90</p>

  <template #footer>
    <BaseButton variant="primary">Finalizar Compra</BaseButton>
  </template>
</BaseCard>
```

## Props e Emits

### Props
- Sempre tipifique props com TypeScript
- Use `withDefaults` para valores padrão
- Documente props quando necessário
- Evite props muito genéricas (ex: `data`, `value`)
- Use `required: true` para props obrigatórias

```vue
<script setup lang="ts">
interface Props {
  title: string
  description?: string
  items: Item[]
  variant?: 'default' | 'compact'
}

withDefaults(defineProps<Props>(), {
  description: '',
  variant: 'default',
})
</script>
```

### Emits
- Declare todos os eventos emitidos
- Tipifique os payloads dos eventos
- Use nomes descritivos e consistentes
- Para `v-model`, use o padrão `modelValue` / `update:modelValue`
- Para múltiplos `v-model`s, use nomes explícitos: `modelValue`, `update:modelValue`, `visible`, `update:visible`

```vue
<script setup lang="ts">
interface Props {
  modelValue: string
  visible: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:visible': [value: boolean]
  submit: [payload: FormPayload]
}>()
</script>
```

## Acessibilidade

### HTML Semântico
- Use tags semânticas apropriadas: `<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`
- Use `<button>` para ações e `<a>` para navegação
- Evite `<div>` e `<span>` clicáveis sem papel apropriado

### Atributos ARIA
- Adicione `aria-label` em botões de ícone
- Use `aria-describedby` para associar mensagens de erro a inputs
- Use `aria-live` para anúncios dinâmicos importantes
- Evite atributos ARIA desnecessários quando HTML semântico já resolve

```vue
<!-- ✅ Bom: botão de ícone acessível -->
<button aria-label="Fechar modal" @click="close">
  <IconClose />
</button>

<!-- ❌ Ruim: div clicável sem acessibilidade -->
<div class="close" @click="close">X</div>
```

### Formulários Acessíveis
- Associe `<label>` a inputs via `for` + `id`
- Exiba mensagens de erro claras e associadas ao campo
- Use `aria-invalid` quando o campo estiver inválido
- Gerencie foco ao exibir erros ou modais

```vue
<template>
  <div class="field">
    <label :for="inputId">Email</label>
    <input
      :id="inputId"
      v-model="email"
      type="email"
      :aria-invalid="hasError"
      :aria-describedby="hasError ? errorId : undefined"
    />
    <p v-if="hasError" :id="errorId" class="error">Email inválido</p>
  </div>
</template>
```

### Foco e Navegação por Teclado
- Garanta foco visível em todos os elementos interativos
- Gerencie `tabindex` em modais e drawers
- Permita fechar modais com `Escape`
- Trave o foco dentro de modais abertos

## Responsividade

### Mobile-First
- Escreva estilos mobile-first: comece pelo menor breakpoint
- Use breakpoints para aumentar complexidade em telas maiores
- Evite breakpoints desnecessários

```css
/* ✅ Bom: mobile-first */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Tailwind CSS
- Se o projeto usa Tailwind, use classes utilitárias conforme design system
- Evite classes arbitrárias excessivas (ex: `w-[123px]`)
- Centralize variações em componentes base
- Use `@apply` com moderação para evitar duplicação

```vue
<!-- ✅ Bom: classes utilitárias consistentes -->
<template>
  <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
    Salvar
  </button>
</template>
```

```vue
<!-- ❌ Ruim: valores arbitrários espalhados -->
<template>
  <button class="px-[17px] py-[9px] bg-[#3b82f6] text-[#fff] rounded-[5px]">
    Salvar
  </button>
</template>
```

### CSS Scoped
- Use `<style scoped>` para estilos específicos do componente
- Evite seletores muito específicos ou `!important`
- Use classes com BEM-like naming quando necessário
- Não estilize elementos globais dentro de componentes scoped

```vue
<style scoped>
.user-card {
  padding: 1rem;
  border: 1px solid var(--color-border);
}

.user-card__title {
  font-size: 1.25rem;
  font-weight: 600;
}
</style>
```

### CSS Modules
- Se o projeto usa CSS Modules, use `module` attribute e nomes descritivos
- Importe classes como objeto tipado quando possível

```vue
<template>
  <div :class="$style.card">
    <h2 :class="$style.title">Título</h2>
  </div>
</template>

<style module>
.card {
  padding: 1rem;
}

.title {
  font-size: 1.25rem;
}
</style>
```

## Animações e Transições

- Use `<Transition>` e `<TransitionGroup>` do Vue para animações de entrada/saída
- Prefira transições CSS em vez de animações JavaScript para performance
- Respeite `prefers-reduced-motion` para usuários sensíveis a movimento

```vue
<template>
  <Transition name="fade">
    <p v-if="visible">Conteúdo</p>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
```

## Ícones e Imagens

- Use uma biblioteca de ícones consistente (ex: Heroicons, Phosphor, FontAwesome)
- Importe ícones como componentes Vue quando possível
- Use `alt` descritivo em imagens
- Otimize imagens para web

## Verificação de UI

Antes de finalizar uma tarefa de UI:
- Verifique se componentes base existem e podem ser reutilizados
- Confirme contraste de cores e tamanhos de toque mínimos (44x44px)
- Teste em diferentes tamanhos de tela
- Valide markup com inspeção de acessibilidade
- Execute `pnpm lint` e `pnpm typecheck`

## Módulos Relacionados

- **vue-core.md**: Stack, estrutura de pastas, Composition API, Pinia, Vue Router
- **vue-testing.md**: Testes de componentes e E2E
- **vue-checklist.md**: Checklist consolidado para verificação antes de commit
