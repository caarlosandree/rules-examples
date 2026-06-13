---
trigger: always_on
description: Regras fundamentais de desenvolvimento Angular 17+: stack tecnológica, princípios, estrutura de pastas, nomenclatura, formatação, standalone components, injeção de dependências, signals, roteamento, variáveis de ambiente, git/commits e módulos relacionados.
globs: **/*.{ts,html,scss}
---
# Regras de Desenvolvimento - Angular Core

## Stack Tecnológica

Este projeto utiliza:
- **Angular 17+** como framework SPA
- **TypeScript 5.x** com `strict: true`
- **Standalone Components** como padrão (sem `NgModule` em novos componentes)
- **Angular Signals** para estado reativo local e derivado
- **RxJS** para streams assíncronas, HTTP e eventos
- **Angular Material** como biblioteca de componentes UI
- **Angular Router** para roteamento declarativo
- **Angular Forms** (Reactive Forms) para formulários
- **Jasmine/Karma** ou **Jest** para testes unitários
- **Angular Testing Library** para testes orientados ao comportamento
- **ESLint** + **Prettier** para lint e formatação
- **Node** >= 20 (engines no `package.json`)
- **Path alias `@/`** configurado no `tsconfig.json` apontando para `src/`

## Princípios Gerais

### Código Limpo e Legível
- Escreva código que seja fácil de entender para você e outros desenvolvedores
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

```
src/
├── app/
│   ├── core/                 # Singletons, guards, interceptors, models globais
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── models/
│   │   ├── services/
│   │   └── core.config.ts
│   ├── features/             # Funcionalidades organizadas por domínio
│   │   ├── users/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── users.routes.ts
│   │   └── orders/
│   │       └── ...
│   ├── shared/               # Componentes, pipes, diretivas e utilitários reutilizáveis
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── utils/
│   └── app.config.ts
├── assets/
├── environments/
├── index.html
├── main.ts
├── styles.scss
└── tsconfig.json
```

- `core/`: código global, carregado uma única vez na aplicação (guards, interceptors, models de domínio transversal)
- `features/`: organização por funcionalidade de negócio; cada pasta contém componentes, páginas, services e models próprios
- `shared/`: elementos puramente reutilizáveis e sem dependência de domínio específico

### Nomenclatura

#### Arquivos (kebab-case)
- Componentes: `user-profile.component.ts`
- Templates: `user-profile.component.html`
- Estilos: `user-profile.component.scss`
- Services: `user.service.ts`
- Guards: `auth.guard.ts`
- Interceptors: `auth.interceptor.ts`
- Diretivas: `highlight.directive.ts`
- Pipes: `brazilian-date.pipe.ts`
- Models: `user.model.ts`
- Configurações: `app.config.ts`
- Testes: `user.service.spec.ts`

#### Classes (PascalCase)
- Componentes: `UserProfileComponent`
- Services: `UserService`
- Guards: `AuthGuard`
- Interceptors: `AuthInterceptor`
- Diretivas: `HighlightDirective`
- Pipes: `BrazilianDatePipe`
- Models/Interfaces: `User`, `Order`

#### Variáveis, Funções e Propriedades (camelCase)
- `userName`, `isLoading`, `loadUserData()`

#### Constantes (UPPER_SNAKE_CASE)
- `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`

#### Nomes Descritivos
- ✅ Bom: `handleSubmitForm`, `calculateTotalPrice`, `isUserAuthenticated`
- ❌ Ruim: `handle`, `calc`, `flag`, `x`, `data`, `temp`

### Organização do Código

#### Estrutura de um Componente Angular
```typescript
/**
 * Componente: UserProfileComponent
 *
 * Descrição: Exibe o perfil do usuário logado e permite editar dados básicos.
 */
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { UserService } from '@/app/features/users/services/user.service';
import { User } from '@/app/core/models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);

  readonly user = signal<User | null>(null);
  readonly isLoading = signal(false);
  readonly fullName = computed(() => {
    const currentUser = this.user();
    return currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '';
  });

  readonly profileForm = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.isLoading.set(true);
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user.set(user);
        this.profileForm.patchValue(user);
      },
      error: () => this.isLoading.set(false),
      complete: () => this.isLoading.set(false),
    });
  }

  handleSubmitForm(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.userService.updateUser(this.profileForm.value as Partial<User>).subscribe({
      next: (updatedUser) => this.user.set(updatedUser),
    });
  }
}
```

#### Ordem Recomendada em uma Classe
1. Propriedades privadas de dependência (`private readonly service = inject(...)`)
2. Signals e estado reativo público
3. Computed values
4. Formulários e referências de template
5. Ciclo de vida (`ngOnInit`, `ngOnDestroy`, etc.)
6. Métodos públicos (handlers)
7. Métodos privados auxiliares

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
- Configure `prettier` e `eslint` com regras do Angular (`@angular-eslint`)

### Comentários

#### Comentários de Arquivo
```typescript
/**
 * Componente: UserProfileComponent
 *
 * Descrição: Exibe e edita o perfil do usuário logado.
 *
 * @author Carlos André Sabino
 * @created 2024-01-15
 */
```

#### Comentários no Código
- Comente apenas o **porquê**, não o **o quê**
- Comente lógica complexa ou não óbvia
- Evite comentários redundantes
- Use comentários JSDoc para funções públicas e services

```typescript
// ✅ Bom: Explica o porquê
// Aguarda 300ms para evitar requisições a cada tecla digitada
private readonly searchDebounceMs = 300;

// ❌ Ruim: Redundante
// Incrementa o contador
this.counter.update((value) => value + 1);
```

## Padrões Específicos do Stack

### Standalone Components
- Todos os componentes novos devem ser `standalone: true`
- Declare explicitamente os imports necessários em cada componente
- Evite criar novos `NgModules`; use standalone components e `provide*` functions
- Para agrupar funcionalidades, prefira arquivos de configuração e routes

```typescript
// ✅ Bom
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './user-card.component.html',
})
export class UserCardComponent {
  @Input({ required: true }) user!: User;
}

// ❌ Ruim: Criar módulo sem necessidade em projeto Angular 17+
@NgModule({
  declarations: [UserCardComponent],
  imports: [CommonModule, MatCardModule],
  exports: [UserCardComponent],
})
export class UserCardModule {}
```

### Injeção de Dependências
- Use `inject()` ao invés de construtor para injeção de dependências
- Marque dependências privadas como `private readonly`
- Evite injetar serviços diretamente em templates; exponha signals/métodos

```typescript
// ✅ Bom
export class UserListComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly users = toSignal(this.userService.getUsers(), { initialValue: [] });

  navigateToDetail(userId: string): void {
    this.router.navigate(['/users', userId]);
  }
}

// ❌ Ruim
export class UserListComponent {
  constructor(
    private userService: UserService,
    private router: Router,
  ) {}
}
```

### Services
- Cada service deve ter responsabilidade única
- Retorne `Observable<T>` para operações assíncronas
- Utilize `HttpClient` para chamadas HTTP
- Faça parsing/transformação de dados no service, não no componente
- Use signals quando o service possuir estado compartilhado simples

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  getUsers(): Observable<User[]> {
    return this.httpClient
      .get<UserResponse[]>(`${this.apiUrl}/users`)
      .pipe(map((response) => response.map(this.toUser)));
  }

  getUserById(id: string): Observable<User> {
    return this.httpClient.get<User>(`${this.apiUrl}/users/${id}`);
  }

  private toUser(response: UserResponse): User {
    return {
      id: response.id,
      fullName: `${response.first_name} ${response.last_name}`,
      email: response.email,
    };
  }
}
```

### Signals e Observables
- Use **signals** para estado local sincronizável e derivado
- Use **observables** para streams assíncronas, HTTP, timers e eventos
- Converta de Observable para Signal com `toSignal()` quando apropriado
- Use `effect()` com cautela; prefira `computed()` para derivados reativos

```typescript
export class CounterComponent {
  readonly count = signal(0);
  readonly doubleCount = computed(() => this.count() * 2);

  increment(): void {
    this.count.update((value) => value + 1);
  }
}
```

```typescript
export class UserListComponent {
  private readonly userService = inject(UserService);

  readonly users = toSignal(this.userService.getUsers(), { initialValue: [] as User[] });
}
```

### Roteamento
- Defina rotas por feature em arquivos `*.routes.ts`
- Use lazy loading com `loadComponent` e `loadChildren`
- Proteja rotas com functional guards (`CanActivateFn`)

```typescript
// users.routes.ts
export const USER_ROUTES: Routes = [
  {
    path: '',
    component: UsersPageComponent,
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/user-detail/user-detail.component').then((m) => m.UserDetailComponent),
    canActivate: [authGuard],
  },
];
```

```typescript
// app.routes.ts
export const APP_ROUTES: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.routes').then((m) => m.USER_ROUTES),
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', component: NotFoundPageComponent },
];
```

### Variáveis de Ambiente
- Use `environment.ts` e `environment.prod.ts` em `src/environments/`
- Nunca armazene segredos em arquivos de environment do cliente
- Variáveis sensíveis devem ser lidas pelo backend
- Mantenha os ambientes sincronizados e documentados

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
};
```

```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.exemplo.com/api',
};
```

### Git e Commits
- Faça commits frequentes e atômicos
- Use mensagens de commit descritivas
- Um commit = uma mudança lógica
- Siga o padrão: `tipo: descrição curta` (ex: `feat: adiciona componente UserProfile`)

**Nota**: Para padrões detalhados de commits, consulte o arquivo de regras `commit.md`.

## Restrições Operacionais

- **Não inicie o servidor de desenvolvimento** (`ng serve`) por conta própria — assuma que já está rodando ou peça ao usuário. Antes de declarar pronto, valide com `ng lint` e `ng test`.
- **Não inicie serviços locais** (`docker compose up`, `docker run`, `brew services start`) sem pedido explícito.
- **Sem `any`**: evite `any` no TypeScript; prefira tipos específicos ou `unknown`.
- Path alias `@/` aponta para `src/`. Use para todos os imports internos.

## Módulos Relacionados

Este arquivo contém as regras fundamentais do Angular. Para regras específicas, consulte:

- **angular-ui.md**: Componentes Angular, templates, diretivas, pipes, Angular Material, acessibilidade, responsividade e change detection
- **angular-testing.md**: Testes com Jasmine/Karma/Jest, Angular Testing Library, mocks e testes de componentes e services
- **angular-checklist.md**: Checklist consolidado para verificação antes de commit
