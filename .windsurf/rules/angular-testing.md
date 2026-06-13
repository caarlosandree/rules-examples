---
trigger: always_on
description: Regras de testes para Angular 17+: Jasmine/Karma ou Jest, Angular Testing Library, testes de componentes, services, diretivas, pipes e mocks.
globs: **/*.{ts,html,scss}
---
# Regras de Testes - Angular

## Stack de Testes

Este projeto utiliza:
- **Jasmine** como framework de testes
- **Karma** ou **Jest** como runner (conforme configurado no projeto)
- **Angular Testing Library** (`@testing-library/angular`) para testes orientados ao comportamento do usuário
- **`@angular/core/testing`** para utilitários do Angular
- **TestBed** para configuração de testes de integração
- **jest-when** ou **jasmine-mock** para mocks avançados (quando disponível)

## Princípios de Testes

### Teste Comportamento, Não Implementação
- Escreva testes que verifiquem o que o usuário vê e pode fazer
- Evite testar detalhes internos do componente
- Prefira queries do Testing Library (`screen.getByRole`, `screen.getByText`) ao invés de acessar propriedades privadas

### Testes Unitários Rápidos e Isolados
- Cada teste deve ser independente
- Limpe estado entre testes com `beforeEach` e `afterEach`
- Mock serviços externos e chamadas HTTP

### Nomes Descritivos
- Descreva o comportamento esperado em português brasileiro
- Use estrutura `should ... when ...`

```typescript
// ✅ Bom
it('deve exibir mensagem de erro quando o formulário for inválido', () => {
  // ...
});

// ❌ Ruim
it('testa erro', () => {
  // ...
});
```

## Configuração do TestBed

### Testes de Componente
```typescript
import { render, screen, fireEvent } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UserProfileComponent } from './user-profile.component';
import { UserService } from '@/app/features/users/services/user.service';

const mockUserService = {
  getCurrentUser: jest.fn().mockReturnValue(of({ id: '1', name: 'Carlos' })),
  updateUser: jest.fn().mockReturnValue(of({ id: '1', name: 'Carlos André' })),
};

describe('UserProfileComponent', () => {
  const setup = async () => {
    return render(UserProfileComponent, {
      providers: [{ provide: UserService, useValue: mockUserService }],
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve exibir o nome do usuário ao carregar', async () => {
    await setup();

    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });
});
```

### Testes com TestBed (quando necessário)
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileComponent } from './user-profile.component';
import { UserService } from '@/app/features/users/services/user.service';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
```

## Testes de Componentes

### Renderização e Interação
```typescript
it('deve desabilitar o botão de salvar quando o formulário estiver inválido', async () => {
  await setup();

  const saveButton = screen.getByRole('button', { name: /salvar/i });
  expect(saveButton).toBeDisabled();
});

it('deve chamar updateUser ao submeter formulário válido', async () => {
  const user = userEvent.setup();
  await setup();

  await user.type(screen.getByLabelText(/nome/i), 'Carlos André');
  await user.type(screen.getByLabelText(/e-mail/i), 'carlos@exemplo.com');

  const saveButton = screen.getByRole('button', { name: /salvar/i });
  await user.click(saveButton);

  expect(mockUserService.updateUser).toHaveBeenCalledWith({
    firstName: 'Carlos André',
    email: 'carlos@exemplo.com',
  });
});
```

### Queries Prioritárias
Siga a ordem de prioridade do Testing Library:
1. `getByRole`
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByDisplayValue`
6. `getByAltText`
7. `getByTitle`
8. `getByTestId` (último recurso)

```typescript
// ✅ Bom
screen.getByRole('button', { name: /salvar/i });
screen.getByLabelText(/e-mail/i);

// ❌ Ruim
screen.getByTestId('save-button');
```

## Testes de Services

### Isolamento de HTTP
- Use `HttpTestingController` para interceptar requisições HTTP
- Verifique a URL, método e corpo da requisição
- Nunca faça chamadas reais em testes

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { UserService } from './user.service';
import { environment } from '@/environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), UserService],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve retornar lista de usuários', () => {
    const mockUsers = [{ id: '1', name: 'Carlos' }];

    service.getUsers().subscribe((users) => {
      expect(users).toEqual(mockUsers);
    });

    const request = httpMock.expectOne(`${environment.apiBaseUrl}/users`);
    expect(request.request.method).toBe('GET');
    request.flush(mockUsers);
  });
});
```

### Services com Estado
```typescript
it('deve atualizar o signal de usuário ao chamar setCurrentUser', () => {
  const user = { id: '1', name: 'Carlos' };

  service.setCurrentUser(user);

  expect(service.currentUser()).toEqual(user);
});
```

## Testes de Pipes

```typescript
import { BrazilianDatePipe } from './brazilian-date.pipe';

describe('BrazilianDatePipe', () => {
  const pipe = new BrazilianDatePipe();

  it('deve formatar uma data ISO para padrão brasileiro', () => {
    expect(pipe.transform('2024-01-15')).toBe('15/01/2024');
  });

  it('deve retornar string vazia para valor nulo', () => {
    expect(pipe.transform(null as unknown as string)).toBe('');
  });
});
```

## Testes de Diretivas

```typescript
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighlightDirective } from './highlight.directive';

@Component({
  standalone: true,
  template: `<span appHighlight>Texto destacado</span>`,
  imports: [HighlightDirective],
})
class TestComponent {}

describe('HighlightDirective', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('deve aplicar background amarelo ao passar o mouse', () => {
    const element = fixture.nativeElement.querySelector('span');
    element.dispatchEvent(new Event('mouseenter'));

    expect(element.style.backgroundColor).toBe('yellow');
  });
});
```

## Mocks

### Mock de Serviços
```typescript
const mockAuthService = {
  isAuthenticated: jest.fn().mockReturnValue(true),
  login: jest.fn().mockReturnValue(of({ token: 'abc' })),
  logout: jest.fn(),
};
```

### Mock de Observables
```typescript
// ✅ Bom
const mockUser$ = of({ id: '1', name: 'Carlos' });

// ✅ Para erro
const mockError$ = throwError(() => new Error('Erro ao carregar'));
```

### Mock de Signals
```typescript
// ✅ Bom
const mockUserService = {
  currentUser: signal<User | null>(null),
  loadUser: jest.fn(),
};
```

### Mock de Router
```typescript
const mockRouter = {
  navigate: jest.fn().mockResolvedValue(true),
};

providers: [{ provide: Router, useValue: mockRouter }];
```

## Testes de Roteamento

### Guards
```typescript
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  it('deve permitir acesso quando autenticado', () => {
    const mockAuthService = { isAuthenticated: jest.fn().mockReturnValue(true) };

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });
});
```

## Cobertura e Qualidade

### O Que Testar
- Regras de negócio críticas
- Validação de formulários
- Transformações de dados
- Comportamentos de UI importantes
- Navegação e guards
- Tratamento de erros

### O Que Não Testar
- Frameworks e bibliotecas de terceiros
- Código trivial sem lógica
- Detalhes de implementação privados
- Estilos CSS puros (exceto a11y)

### Cobertura Mínima
- Busque cobertura mínima de 70% para regras de negócio
- Priorize qualidade sobre quantidade
- Testes devem ser confiáveis e rápidos

## Restrições Operacionais

- **Não ignore testes falhando** — corrija ou remova testes obsoletos
- **Não use `xit`/`xdescribe` sem explicação** no PR
- **Não use `fdescribe`/`fit` em commits** — remova foco antes de submeter
- Rode `ng test` localmente antes de abrir PR

## Módulos Relacionados

- **angular-core.md**: Stack, estrutura, services, signals e padrões gerais
- **angular-ui.md**: Componentes, templates, diretivas, pipes, acessibilidade e change detection
- **angular-checklist.md**: Checklist pré-commit para projetos Angular
