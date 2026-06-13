---
trigger: always_on
description: Checklist pré-commit para projetos Angular 17+. Verificações obrigatórias de código, UI, testes, performance e segurança antes de submeter alterações.
globs: **/*.{ts,html,scss}
---
# Checklist Pré-Commit - Angular

Execute este checklist antes de cada commit ou pull request.

## ✅ Validação de Código

- [ ] O código compila sem erros (`ng build`)
- [ ] O lint passa sem warnings (`ng lint`)
- [ ] O TypeScript está em modo estrito (`strict: true`) sem erros de tipo
- [ ] Não há uso de `any` sem justificativa documentada
- [ ] Não há `console.log`, `debugger` ou código de debug esquecido
- [ ] Não há imports não utilizados
- [ ] Path alias `@/` é usado para imports internos
- [ ] Não há variáveis ou funções sem uso
- [ ] Não há comentários redundantes ou desatualizados

### Comandos
```bash
ng build
ng lint
```

## ✅ Estrutura e Organização

- [ ] Arquivos seguem kebab-case e classes seguem PascalCase
- [ ] Componentes estão em pastas coerentes (`features/`, `shared/`, `core/`)
- [ ] Cada componente/service tem responsabilidade única
- [ ] Não há criação desnecessária de `NgModule` (projetos Angular 17+ usam standalone)
- [ ] Rotas estão organizadas em arquivos `*.routes.ts`
- [ ] Models estão centralizados e reutilizados corretamente

## ✅ Componentes e Templates

- [ ] Todos os componentes novos são `standalone: true`
- [ ] Imports são declarados explicitamente em cada componente
- [ ] Inputs obrigatórios usam `input.required()` ou `@Input({ required: true })`
- [ ] Templates usam a nova sintaxe de control flow (`@if`, `@for`, `@switch`)
- [ ] `@for` possui `track` correto (id ou referência estável)
- [ ] Não há lógica complexa no template; use `computed()` no componente
- [ ] Não há chamadas de métodos diretamente no template
- [ ] Two-way binding é usado com critério

### Exemplos
```html
<!-- ✅ Correto -->
@for (user of users(); track user.id) {
  <app-user-card [user]="user" />
}

<!-- ❌ Incorreto -->
<div *ngFor="let user of users()">{{ user.name }}</div>
```

## ✅ UI e Acessibilidade

- [ ] HTML semântico é usado corretamente
- [ ] Todos os campos de formulário possuem label
- [ ] Mensagens de erro possuem `aria-describedby`
- [ ] Elementos interativos são acessíveis por teclado
- [ ] Cores usam tokens do tema (não hex/rgb crus)
- [ ] Layout é responsivo (mobile-first)
- [ ] Componentes do Angular Material são usados quando apropriado
- [ ] `changeDetection: ChangeDetectionStrategy.OnPush` está configurado

## ✅ Signals e Estado

- [ ] Estado local usa signals
- [ ] Valores derivados usam `computed()`
- [ ] Efeitos colaterais usam `effect()` apenas quando necessário
- [ ] Observables são convertidos para signals quando apropriado (`toSignal`)
- [ ] Não há mutação de objetos ou arrays; prefira imutabilidade

### Exemplos
```typescript
// ✅ Correto
readonly users = signal<User[]>([]);
readonly activeUsers = computed(() => this.users().filter((user) => user.active));

// ❌ Incorreto
readonly users: User[] = [];
this.users.push(newUser);
```

## ✅ Injeção de Dependências

- [ ] `inject()` é usado ao invés de construtor
- [ ] Dependências privadas são `private readonly`
- [ ] Serviços são fornecidos com `providedIn: 'root'` quando singletons
- [ ] Não há lógica de negócio em construtores

## ✅ Services e HTTP

- [ ] Cada service tem responsabilidade única
- [ ] Chamadas HTTP retornam tipos fortemente tipados
- [ ] Tratamento de erro está implementado
- [ ] Transformações de dados ocorrem no service
- [ ] URLs de API usam `environment.apiBaseUrl`

## ✅ Testes

- [ ] Testes unitários passam (`ng test`)
- [ ] Novos componentes possuem testes de comportamento
- [ ] Novos services possuem testes isolados
- [ ] Mocks são usados para serviços externos e HTTP
- [ ] Testes não acessam propriedades privadas sem necessidade
- [ ] Não há `fit`, `fdescribe`, `xit` ou `xdescribe` esquecidos
- [ ] Nome dos testes descreve comportamento esperado

### Comandos
```bash
ng test --watch=false --browsers=ChromeHeadless
```

## ✅ Roteamento

- [ ] Rotas usam lazy loading com `loadComponent`/`loadChildren`
- [ ] Guards protegem rotas privadas
- [ ] Rotas desconhecidas redirecionam para página 404
- [ ] Navegação programática usa `Router.navigate()` corretamente

## ✅ Formulários

- [ ] Reactive Forms são usados para formulários não triviais
- [ ] Validações são declarativas e centralizadas
- [ ] Mensagens de erro são exibidas com base no estado do controle
- [ ] Formulário é marcado como touched antes de submeter

## ✅ Performance

- [ ] OnPush está habilitado em componentes novos
- [ ] Imagens usam `NgOptimizedImage` quando apropriado
- [ ] Componentes pesados usam `@defer` para lazy loading
- [ ] Não há subscriptions sem unsubscribe (use `takeUntilDestroyed` ou `async` pipe)
- [ ] Listas longas usam virtual scroll quando apropriado

## ✅ Segurança

- [ ] Não há segredos em arquivos de environment
- [ ] Inputs de usuário são validados antes de envio
- [ ] Não há uso de `innerHTML` com conteúdo dinâmico sem sanitização
- [ ] Variáveis sensíveis não são expostas no cliente
- [ ] Autenticação e autorização são validadas no backend

## ✅ Git e Commits

- [ ] Commit é atômico e representa uma mudança lógica
- [ ] Mensagem de commit segue o padrão convencional
- [ ] Não há arquivos não relacionados no commit
- [ ] Arquivos gerados (`dist/`, `coverage/`) estão no `.gitignore`

**Nota**: Para padrões detalhados de commits, consulte o arquivo de regras `commit.md`.

## ✅ Documentação

- [ ] Código complexo possui comentário explicando o porquê
- [ ] README foi atualizado se necessário
- [ ] Decisões arquiteturais importantes estão documentadas

## Comando Consolidado

Antes de finalizar, execute:

```bash
ng lint && ng build && ng test --watch=false --browsers=ChromeHeadless
```

## Módulos Relacionados

- **angular-core.md**: Stack, estrutura, nomenclatura, standalone components, services, signals, roteamento
- **angular-ui.md**: Componentes, templates, diretivas, pipes, Angular Material, acessibilidade e change detection
- **angular-testing.md**: Testes com Jasmine/Karma/Jest, Angular Testing Library, mocks e testes de componentes e services
