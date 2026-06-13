---
trigger: always_on
description: Regras de UI para Angular 17+: componentes, templates, diretivas, pipes, bibliotecas de componentes (Angular Material), acessibilidade, responsividade e change detection.
globs: **/*.{ts,html,scss}
---
# Regras de UI - Angular

## Componentes

### Padrão Standalone
- Todos os componentes devem ser `standalone: true`
- Importe apenas os módulos e componentes realmente utilizados
- Divida componentes grandes em componentes menores e reutilizáveis
- Use `@Input({ required: true })` para propriedades obrigatórias
- Use `@Output()` para eventos com EventEmitter
- Prefira `output()` (Angular 16+) ao invés de `@Output()` em novos projetos

```typescript
// ✅ Bom
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss',
})
export class UserCardComponent {
  readonly user = input.required<User>();
  readonly selected = output<string>();
}
```

```typescript
// ❌ Ruim
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './user-card.component.html',
})
export class UserCardComponent {
  @Input() user: User | undefined;
  @Output() selected = new EventEmitter<string>();
}
```

### Separação de Responsabilidades
- Componentes de página (`pages/`) orquestram dados e estado
- Componentes pequenos (`components/`) renderizam UI pura
- Componentes compartilhados (`shared/components/`) são genéricos e reutilizáveis

```
features/users/
├── components/
│   ├── user-card/
│   └── user-list/
└── pages/
    ├── users-page/
    └── user-detail-page/
```

### Nomeação de Seletores
- Use prefixo do projeto (`app-`) para todos os componentes
- Seletores devem refletir o propósito do componente
- Evite nomes genéricos como `app-card`, `app-list`

- ✅ Bom: `app-user-profile`, `app-order-summary`
- ❌ Ruim: `app-component`, `app-item`

## Templates

### Sintaxe de Template
- Use interpolação `{{ }}` para exibição simples de dados
- Use property binding `[propriedade]` para atribuir valores a propriedades
- Use event binding `(evento)` para capturar eventos
- Use two-way binding com cautela; prefira unidirecional quando possível

```html
<!-- ✅ Bom -->
<app-user-card
  [user]="currentUser()"
  (selected)="onUserSelected($event)"
></app-user-card>

<!-- ❌ Ruim: two-way desnecessário -->
<input [(ngModel)]="searchTerm" />
```

### Control Flow Novo (Angular 17+)
- Use a nova sintaxe de control flow (`@if`, `@for`, `@switch`) ao invés de `*ngIf`, `*ngFor`, `*ngSwitch`
- Use `@defer` para lazy loading de componentes pesados
- Use `@let` para variáveis locais quando apropriado

```html
<!-- ✅ Bom -->
@if (isLoading()) {
  <app-loading-spinner />
} @else if (users().length > 0) {
  <ul>
    @for (user of users(); track user.id) {
      <li>{{ user.name }}</li>
    }
  </ul>
} @else {
  <app-empty-state message="Nenhum usuário encontrado" />
}
```

```html
<!-- ❌ Ruim: sintaxe legada -->
<ng-container *ngIf="isLoading(); else loaded">
  <app-loading-spinner></app-loading-spinner>
</ng-container>
<ng-template #loaded>
  <ul>
    <li *ngFor="let user of users()">{{ user.name }}</li>
  </ul>
</ng-template>
```

### Bindings e Expressões
- Mantenha expressões em templates simples
- Evite chamadas de métodos complexos diretamente no template
- Use `computed()` para valores derivados no componente

```html
<!-- ✅ Bom -->
<p>{{ fullName() }}</p>
<button [disabled]="isFormInvalid()">Salvar</button>

<!-- ❌ Ruim -->
<p>{{ getFullName(user) }}</p>
<button [disabled]="!form.valid || isLoading || hasErrors()">Salvar</button>
```

### Templates Inline vs Arquivo Separado
- Use arquivo separado (`templateUrl`) para templates com mais de 3 linhas
- Use template inline (`template: `) apenas para componentes muito pequenos

## Diretivas

### Diretivas de Atributo
- Use diretivas para comportamentos reutilizáveis em elementos
- Prefira diretivas standalone

```typescript
// ✅ Bom
@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  private readonly elementRef = inject(ElementRef);

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.elementRef.nativeElement.style.backgroundColor = 'yellow';
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.elementRef.nativeElement.style.backgroundColor = '';
  }
}
```

### Diretivas Estruturais
- Evite criar diretivas estruturais customizadas em novos projetos
- Prefira a nova sintaxe de control flow ou componentes condicionais

## Pipes

### Pipes Puros
- Crie pipes puros (`pure: true`, padrão) para transformações de dados
- Nunca execute side-effects em pipes
- Use pipes para formatação de data, moeda, telefone, CPF/CNPJ, etc.

```typescript
// ✅ Bom
@Pipe({
  name: 'brazilianDate',
  standalone: true,
})
export class BrazilianDatePipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleDateString('pt-BR');
  }
}
```

```html
<!-- ✅ Bom -->
<p>{{ createdAt | brazilianDate }}</p>

<!-- ❌ Ruim: formatação no template -->
<p>{{ createdAt.toLocaleDateString('pt-BR') }}</p>
```

## Bibliotecas de Componentes

### Angular Material
- Use Angular Material como biblioteca padrão de componentes
- Importe apenas os módulos necessários
- Siga as diretrizes de densidade e temas do Material Design 3
- Customise através de tokens de tema, não com CSS arbitrário

```typescript
// ✅ Bom
@Component({
  standalone: true,
  imports: [MatButtonModule, MatInputModule, MatFormFieldModule],
})
export class LoginComponent {}
```

### Substituição de Componentes
- Substitua componentes do Material apenas quando necessário
- Componentes customizados devem estar em `shared/components/`
- Documente a razão de substituição quando não óbvia

## Acessibilidade (a11y)

### HTML Semântico
- Use elementos semânticos (`header`, `nav`, `main`, `section`, `article`, `footer`)
- Evite `div` e `span` genéricos para estrutura principal

```html
<!-- ✅ Bom -->
<main>
  <header>
    <h1>Lista de Usuários</h1>
  </header>
  <section>
    <app-user-list />
  </section>
</main>

<!-- ❌ Ruim -->
<div>
  <div>Lista de Usuários</div>
  <div><app-user-list /></div>
</div>
```

### Labels e ARIA
- Todos os campos de formulário devem ter label associado
- Use `aria-label` apenas quando não houver label visível
- Adicione `aria-describedby` para mensagens de erro
- Use `aria-live` para notificações e mensagens dinâmicas

```html
<!-- ✅ Bom -->
<mat-form-field>
  <mat-label>E-mail</mat-label>
  <input matInput formControlName="email" aria-describedby="email-error" />
  @if (email?.invalid && email?.touched) {
    <mat-error id="email-error">E-mail inválido</mat-error>
  }
</mat-form-field>
```

### Foco e Navegação por Teclado
- Garanta que todos os elementos interativos sejam focáveis
- Mantenha ordem de tabulação lógica
- Forneça feedback visual de foco

### Testes de Acessibilidade
- Utilize `@angular/cdk/a11y` quando necessário
- Teste com leitores de tela periodicamente
- Valide contraste de cores com ferramentas comoaxe DevTools

## Responsividade

### Layout Responsivo
- Use CSS Grid e Flexbox para layouts
- Prefira unidades relativas (`rem`, `%`, `fr`, `vh`, `vw`)
- Evite valores fixos de largura/altura quando possível

```scss
// ✅ Bom
.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

// ❌ Ruim
.user-grid {
  width: 1200px;
}
```

### Breakpoints
- Use breakpoints consistentes com o Material Design
- Defina breakpoints em variáveis SCSS quando o projeto tiver design system

```scss
$breakpoint-sm: 600px;
$breakpoint-md: 960px;
$breakpoint-lg: 1280px;
$breakpoint-xl: 1920px;
```

### Mobile-First
- Escreva estilos mobile-first
- Use `min-width` para progressão de breakpoints

```scss
// ✅ Bom
.card {
  padding: 0.75rem;

  @media (min-width: 960px) {
    padding: 1.5rem;
  }
}
```

## Change Detection

### OnPush por Padrão
- Configure `changeDetection: ChangeDetectionStrategy.OnPush` em todos os componentes novos
- Use signals para garantir reatividade com OnPush
- Evite mutações de objetos/arrays; prefere imutabilidade

```typescript
// ✅ Bom
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, UserCardComponent],
  templateUrl: './user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  readonly users = input.required<User[]>();
}
```

### Evite ChangeDetectorRef Manual
- Só use `ChangeDetectorRef` quando não houver alternativa
- Prefira signals e `async` pipe para atualizações reativas

### Async Pipe
- Use `async` pipe quando necessário com observables legados
- Converta para signals com `toSignal()` quando possível

```html
<!-- ✅ Bom com signals -->
@if (users().length > 0) {
  <app-user-list [users]="users()" />
}

<!-- ✅ Aceitável com async pipe -->
@if (users$ | async; as users) {
  <app-user-list [users]="users" />
}
```

## Estilização

### SCSS
- Use SCSS como linguagem de estilo padrão
- Organize estilos por componente (escopo local)
- Use variáveis e mixins para consistência

### Tokens de Cor e Espaçamento
- Use tokens do tema do Angular Material
- Nunca use cores hexadecimais ou `rgba()` cru diretamente
- Defina espaçamentos com base em uma escala (4px, 8px, 16px, 24px, 32px)

```scss
// ✅ Bom
.card {
  background-color: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
  padding: var(--mat-sys-spacing-4);
}

// ❌ Ruim
.card {
  background-color: #ffffff;
  color: #000000;
  padding: 17px;
}
```

### BEM
- Para componentes customizados, use BEM para nomenclatura de classes

```scss
// ✅ Bom
.user-card {
  &__header {
    font-weight: 500;
  }

  &__avatar {
    border-radius: 50%;
  }

  &--selected {
    border: 2px solid var(--mat-sys-primary);
  }
}
```

## Módulos Relacionados

- **angular-core.md**: Stack, estrutura, nomenclatura, standalone components, services, signals, roteamento
- **angular-testing.md**: Testes de componentes, diretivas, pipes e services
- **angular-checklist.md**: Checklist pré-commit para projetos Angular
