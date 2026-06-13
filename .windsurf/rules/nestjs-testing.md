---
trigger: always_on
description: Regras de testes para projetos NestJS: Jest, testes unitários com mocks de providers, testes de integração com banco real e cobertura de código.
globs: **/*.{ts,js}
---
# Regras de Desenvolvimento - NestJS Testing

## Visão Geral

- Escreva testes como parte do desenvolvimento, não como afterthought
- Testes unitários isolam a unidade sob teste e mockam dependências
- Testes de integração verificam a interação entre camadas e com o banco de dados
- Testes E2E verificam endpoints HTTP completos
- Mantenha testes determinísticos, rápidos e legíveis

## Stack de Testes

- **Jest** como framework de testes
- **@nestjs/testing** para criar módulos de teste
- **@golevelup/ts-jest** ou jest manual para mocks de providers
- **testcontainers** para subir PostgreSQL em testes de integração
- **supertest** para testes E2E de endpoints HTTP
- **faker-js** para geração de dados fictícios

## Configuração do Jest

- Use o `jest.config.ts` ou a configuração no `package.json`
- Configure `coverageDirectory`, `collectCoverageFrom` e `testMatch`
- Use `moduleNameMapper` para paths absolutos do TypeScript
- Mantenha `testEnvironment` como `node`

```typescript
// ✅ Bom: jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@modules/(.*)$': '<rootDir>/modules/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/../test/setup.ts'],
};

export default config;
```

## Testes Unitários

- Isole a unidade sob teste
- Mock todos os providers externos
- Use `Test.createTestingModule` do NestJS
- Teste comportamentos, não implementações
- Organize testes em blocos `describe` e `it` descritivos
- Use `beforeEach` para reiniciar o estado entre testes

```typescript
// ✅ Bom: Teste unitário de service
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);
  });

  it('deve retornar usuário quando encontrado', async () => {
    const user = {
      id: '1',
      email: 'teste@exemplo.com',
      createdAt: new Date(),
    };
    repository.findById.mockResolvedValue(user);

    const result = await service.findById('1');

    expect(result.id).toBe('1');
    expect(result.email).toBe('teste@exemplo.com');
    expect(repository.findById).toHaveBeenCalledWith('1');
  });

  it('deve lançar NotFoundException quando usuário não existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findById('999')).rejects.toThrow(NotFoundException);
  });
});
```

## Mocks de Providers

- Use `useValue` com objetos de mocks quando as interfaces forem simples
- Use `useClass` com classes mock quando necessário
- Prefira `jest.Mocked<Tipagem>` para ter autocomplete dos métodos mockados
- Evite mockar bibliotecas internas sem necessidade
- Mock apenas a camada imediatamente abaixo da unidade testada

```typescript
// ✅ Bom: Mock tipado
const repository: jest.Mocked<UsersRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as unknown as jest.Mocked<UsersRepository>;
```

```typescript
// ✅ Bom: Factory de mocks reutilizável
const createMockRepository = (): jest.Mocked<UsersRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as unknown as jest.Mocked<UsersRepository>);
```

## Testes de Integração

- Suba o banco com testcontainers ou use banco de teste dedicado
- Execute migrations antes dos testes
- Limpe o banco entre testes para evitar interferência
- Teste repositories, services e controllers juntos
- Use transações ou truncate para isolar testes

```typescript
// ✅ Bom: Setup com testcontainers
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaService } from '@shared/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;

beforeAll(async () => {
  container = await new PostgreSqlContainer()
    .withDatabase('test_db')
    .withUsername('test_user')
    .withPassword('test_password')
    .start();

  process.env.DATABASE_URL = container.getConnectionUri();
  prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

  await prisma.$migrate.deploy();
}, 30000);

afterAll(async () => {
  await prisma.$disconnect();
  await container.stop();
});

beforeEach(async () => {
  await prisma.user.deleteMany();
  await prisma.order.deleteMany();
});
```

```typescript
// ✅ Bom: Teste de integração de repository
import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { PrismaService } from '@shared/prisma/prisma.service';

describe('UsersRepository (integration)', () => {
  let repository: UsersRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersRepository, PrismaService],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve criar e buscar usuário', async () => {
    const created = await repository.create({
      email: 'teste@exemplo.com',
      password: 'senhaSegura123',
    });

    const found = await repository.findById(created.id);

    expect(found).not.toBeNull();
    expect(found.email).toBe('teste@exemplo.com');
  });
});
```

## Testes E2E

- Use `INestApplication` com `TestingModule`
- Aplique pipes, interceptors e filtros globais reais
- Use `supertest` para fazer requisições HTTP
- Autentique quando necessário usando helpers
- Limpe o banco entre testes

```typescript
// ✅ Bom: Teste E2E
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (POST) deve criar usuário', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'teste@exemplo.com',
        password: 'senhaSegura123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.email).toBe('teste@exemplo.com');
        expect(res.body.password).toBeUndefined();
      });
  });

  it('/users (POST) deve retornar 400 com dados inválidos', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'invalido' })
      .expect(400);
  });
});
```

## Cobertura

- Exija cobertura mínima de **80%** em linhas e funções
- Não escreva testes apenas para aumentar cobertura; teste comportamentos relevantes
- Ignore arquivos de configuração e DTOs simples quando apropriado
- Revise relatórios de cobertura para identificar gaps críticos

```json
// ✅ Bom: Configuração de cobertura no jest.config.ts
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
```

## Boas Práticas

### Arrange-Act-Assert
```typescript
it('deve calcular desconto corretamente', () => {
  // Arrange
  const price = 100;
  const discount = 10;

  // Act
  const result = service.calculateDiscount(price, discount);

  // Assert
  expect(result).toBe(90);
});
```

### Evite Testes Frágeis
- ✅ Use factories de dados em vez de valores hardcoded espalhados
- ✅ Não dependa da ordem de execução dos testes
- ✅ Limpe o estado entre testes
- ❌ Não teste métodos privados diretamente
- ❌ Não faça assertivas em logs ou mensagens de erro internas

### Helpers e Factories
```typescript
// ✅ Bom: Factory de usuário
import { faker } from '@faker-js/faker/locale/pt_BR';

export const createUserFixture = (overrides: Partial<CreateUserDto> = {}): CreateUserDto => ({
  email: faker.internet.email(),
  password: faker.internet.password({ length: 12 }),
  ...overrides,
});
```

## Execução de Testes

- `pnpm test` — executa testes unitários
- `pnpm test:watch` — executa em modo watch
- `pnpm test:cov` — executa com relatório de cobertura
- `pnpm test:e2e` — executa testes E2E
- `pnpm test:integration` — executa testes de integração

**Nota**: Testes de integração e E2E podem ser lentos. Rode-os explicitamente e não os inclua no watch padrão quando o projeto for grande.

## Módulos Relacionados

- **nestjs-core.md**: Stack, princípios, estrutura, nomenclatura, formatação e padrões NestJS
- **nestjs-api.md**: Controllers, versionamento, DTOs, pipes, guards, interceptors e Swagger
- **nestjs-checklist.md**: Checklist pré-commit para projetos NestJS
