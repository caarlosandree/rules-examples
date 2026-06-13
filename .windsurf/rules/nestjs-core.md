---
trigger: always_on
description: Regras fundamentais de desenvolvimento NestJS: stack, princípios, estrutura de pastas, nomenclatura, formatação, padrões de controllers/services/DI, DTOs, validação, transações e variáveis de ambiente.
globs: **/*.{ts,js}
---
# Regras de Desenvolvimento - NestJS Core

## Stack Tecnológica

Este projeto utiliza:
- **Node.js** (LTS 20+) como runtime
- **TypeScript** (5.x) como linguagem de programação
- **NestJS** (10.x/11.x) como framework principal
- **Express** como HTTP server padrão (ou Fastify quando otimização for necessária)
- **Prisma** ou **TypeORM** como ORM para acesso ao banco de dados
- **PostgreSQL** como banco de dados relacional
- **class-validator** e **class-transformer** para validação e transformação de DTOs
- **@nestjs/config** para gerenciamento de variáveis de ambiente
- **@nestjs/swagger** para documentação OpenAPI/Swagger
- **Jest** para testes unitários e de integração
- **testcontainers** para testes de integração com banco real
- **ESLint** e **Prettier** para lint e formatação
- **pnpm/npm/yarn** como gerenciador de pacotes

A estrutura adota **Package by Feature** com módulos em `src/modules/*` e recursos compartilhados em `src/shared/*`.

## Princípios Gerais

### Código Limpo e Legível
- Sempre escreva código que seja fácil de entender para você e outros desenvolvedores
- Priorize clareza sobre concisão quando necessário
- Use nomes descritivos que expliquem o propósito do código
- Siga os princípios SOLID

### Consistência
- Mantenha estilo de codificação consistente em todo o projeto
- Siga os padrões estabelecidos no projeto
- Use as mesmas convenções de nomenclatura em arquivos relacionados
- Siga as convenções do TypeScript e do NestJS

### Programação para Manutenção
- Escreva código pensando em quem vai mantê-lo no futuro
- Documente decisões complexas ou não óbvias
- Facilite a localização e correção de bugs
- Mantenha métodos pequenos e com responsabilidade única

## Organização e Estrutura

### Estrutura de Pastas

```
src/
  ├── main.ts                    # Ponto de entrada da aplicação
  ├── app.module.ts              # Módulo raiz
  ├── config/                    # Configurações cross-cutting
  │   ├── database.config.ts
  │   ├── swagger.config.ts
  │   └── env.validation.ts
  ├── shared/                    # Domínio-agnóstico reutilizável
  │   ├── exceptions/            # Filtros e classes de exceção customizadas
  │   ├── interceptors/          # Interceptors globais
  │   ├── pipes/                 # Pipes globais
  │   ├── guards/                # Guards globais
  │   ├── decorators/            # Decorators customizados
  │   ├── utils/                 # Funções utilitárias puras
  │   ├── prisma/                # Cliente Prisma / módulo TypeORM
  │   └── dto/                   # DTOs compartilhados (paginação, resposta padrão)
  └── modules/                   # Package by Feature
      ├── users/
      │   ├── users.module.ts
      │   ├── users.controller.ts
      │   ├── users.service.ts
      │   ├── users.repository.ts
      │   ├── dto/
      │   │   ├── create-user.dto.ts
      │   │   ├── update-user.dto.ts
      │   │   └── user-response.dto.ts
      │   ├── entities/          # Entidades TypeORM ou models Prisma
      │   │   └── user.entity.ts
      │   └── tests/
      │       ├── users.service.spec.ts
      │       └── users.e2e-spec.ts
      └── orders/
          ├── orders.module.ts
          ├── orders.controller.ts
          ├── orders.service.ts
          └── dto/
```

### Organização do Código: Package by Feature

**Benefícios do Package by Feature:**
- **Coesão**: Classes relacionadas ficam juntas, facilitando navegação
- **Modularização**: Facilita extração futura para microsserviços
- **Escalabilidade**: Projetos grandes não viram "gavetas de bagunça"
- **Manutenibilidade**: Desenvolvedores encontram código relacionado mais rapidamente

**Nota**: A estrutura "Package by Layer" (`controllers/`, `services/`, `repositories/`) ainda é válida para projetos pequenos, mas para aplicações empresariais, Package by Feature é recomendado.

### Nomenclatura

#### Arquivos e Pastas
- Pastas: **kebab-case** (ex: `users/`, `order-items/`)
- Classes/Interfaces: **PascalCase** (ex: `UsersController.ts`, `UsersService.ts`)
- Decorators: **camelCase** com prefixo `@` (ex: `@CurrentUser()`)
- Módulos: sufixo `.module.ts` (ex: `users.module.ts`)
- Controllers: sufixo `.controller.ts` (ex: `users.controller.ts`)
- Services: sufixo `.service.ts` (ex: `users.service.ts`)
- Repositories: sufixo `.repository.ts` (ex: `users.repository.ts`)
- DTOs: sufixo `.dto.ts` (ex: `create-user.dto.ts`)
- Testes unitários: sufixo `.spec.ts` (ex: `users.service.spec.ts`)
- Testes E2E: sufixo `.e2e-spec.ts` (ex: `users.e2e-spec.ts`)

#### Variáveis, Métodos e Constantes
- Variáveis e métodos: **camelCase** (ex: `userName`, `getUserData()`)
- Constantes globais: **UPPER_SNAKE_CASE** (ex: `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`)
- Interfaces de tipos: **PascalCase**, sem prefixo `I` (ex: `UserResponse`, `CreateUserDto`)
- Enums: **PascalCase** para o enum, **UPPER_SNAKE_CASE** para os valores

```typescript
// ✅ Bom
enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

// ❌ Ruim
enum userStatus {
  active = 'active',
  inactive = 'inactive',
}
```

#### Nomes Descritivos
- ✅ **Bom**: `getUserById()`, `calculateTotalPrice()`, `isUserAuthenticated()`
- ❌ **Ruim**: `get()`, `calc()`, `flag()`, `x`, `data`, `temp`

## Formatação

- Use **2 espaços** para indentação
- Configure `.editorconfig` e `.prettierrc` para manter consistência
- Use aspas simples para strings TypeScript
- Use ponto e vírgula no final das instruções
- Limite de linha de **100 caracteres** (ou 120 em casos excepcionais)
- Use trailing comma em multiline
- Rode `pnpm lint` e `pnpm format` antes de commitar

```json
// ✅ Bom: .prettierrc
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

```json
// ✅ Bom: .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off"
  }
}
```

## Comentários

### Comentários de Arquivo
```typescript
/**
 * Módulo responsável pelo gerenciamento de usuários.
 *
 * Controllers, services, DTOs e repositórios relacionados ao
 * domínio de usuários da aplicação.
 */
```

### Comentários no Código
- Comente apenas o **porquê**, não o **o quê**
- Comente lógica complexa ou não óbvia
- Evite comentários redundantes
- Use JSDoc para métodos e funções públicos expostos externamente

```typescript
// ✅ Bom: Explica o porquê
// Forçamos o lock pessimista para evitar race condition na atualização de saldo
@Transactional()
async updateBalance(userId: string, amount: number): Promise<void> {
  // ...
}

// ❌ Ruim: Redundante
// Incrementa o contador
count++;
```

## Padrões Específicos do NestJS

### Dependency Injection
- Prefira **injeção por construtor**
- Evite `@Inject()` em campos sem necessidade
- Use interfaces/leitura de tipos quando aplicável

```typescript
// ✅ Bom
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}
}

// ❌ Ruim: Injeção em campo
@Injectable()
export class UsersService {
  @Inject()
  private usersRepository: UsersRepository;
}
```

### Controllers
- Retorne DTOs, nunca entidades do banco diretamente
- Use decorators adequados do HTTP
- Use `@Param`, `@Query`, `@Body` corretamente tipados
- Use `@HttpCode` quando o status padrão não for adequado

```typescript
// ✅ Bom
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }
}
```

### Services
- Mantenha a lógica de negócio nos services
- Um service não deve depender de outros controllers
- Use `@Injectable()` em services
- Retorne DTOs mapeados a partir de entidades

```typescript
// ✅ Bom
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado`);
    }

    return new UserResponseDto(user);
  }
}
```

### Providers e Repositories
- Isole o acesso ao banco em repositories dedicados
- Services orquestram, repositories persistem
- Use o `PrismaService` ou `Repository<TypeORM>` como dependência

```typescript
// ✅ Bom: Repository isolado
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

### Decorators Customizados
- Crie decorators para abstrações recorrentes
- Use `createParamDecorator` para informações do request

```typescript
// ✅ Bom
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User;

    return data ? user?.[data] : user;
  },
);
```

## DTOs e Validação

- Use classes, não interfaces, para DTOs que entram nos endpoints
- Use `class-validator` para validar entrada
- Use `ValidationPipe` globalmente
- Use `class-transformer` para transformar e expor campos controlados
- Use `PartialType`, `OmitType`, `PickType` do `@nestjs/mapped-types` quando apropriado

```typescript
// ✅ Bom
export class CreateUserDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}
```

```typescript
// ✅ Bom: Configuração global no main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: false },
  }),
);
```

## Transações

- Use transações para operações que envolvem múltiplas entidades
- Prefira transações no service ou repository, nunca no controller
- Com Prisma: use `$transaction` ou interactive transactions
- Com TypeORM: use `@Transactional()` ou `dataSource.transaction`

```typescript
// ✅ Bom: Prisma transaction
async transfer(fromId: string, toId: string, amount: number): Promise<void> {
  await this.prisma.$transaction(async (tx) => {
    await tx.account.update({ where: { id: fromId }, data: { balance: { decrement: amount } } });
    await tx.account.update({ where: { id: toId }, data: { balance: { increment: amount } } });
    await tx.transaction.create({
      data: { fromId, toId, amount },
    });
  });
}
```

## Variáveis de Ambiente

- Use `@nestjs/config` para carregar variáveis
- Valide variáveis obrigatórias na inicialização
- Nunca commit valores sensíveis
- Use `.env.example` como template
- Separe configurações por ambiente quando necessário

```typescript
// ✅ Bom: Validação de env
export class EnvironmentVariables {
  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsNumber()
  @IsOptional()
  PORT = 3000;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validated;
}
```

```typescript
// ✅ Bom: app.module.ts
ConfigModule.forRoot({
  validate,
  isGlobal: true,
});
```

## Git e Commits

- Faça commits frequentes e atômicos
- Use mensagens de commit descritivas
- Um commit = uma mudança lógica
- Siga o padrão: `tipo: descrição curta` (ex: `feat: adiciona endpoint de skills`)

**Nota**: Para padrões detalhados de commits, consulte o arquivo de regras `commit.md`.

## Documentação

- Mantenha o `README.md` atualizado com setup e desenvolvimento
- Documente endpoints com Swagger/OpenAPI
- Documente versionamento da API e breaking changes
- Inclua exemplos de requisição e resposta quando útil

## Docs Oficiais
- NestJS - https://docs.nestjs.com/
- TypeScript - https://www.typescriptlang.org/docs/
- Prisma - https://www.prisma.io/docs/
- TypeORM - https://typeorm.io/
- class-validator - https://github.com/typestack/class-validator
- Jest - https://jestjs.io/docs/getting-started

## Restrições Operacionais

- **Não inicie serviços locais** (`docker compose up`, `docker run`, `brew services start`) sem pedido explícito do usuário.
- **`pnpm start:dev`/`npm run start:dev`** pode ser executado quando necessário, mas confirme se já não há um servidor rodando.
- **Migrations são imutáveis** após aplicadas — nunca edite migrations existentes. Mudança de schema = nova migration.
- **Valide sempre a entrada** nos controllers com DTOs + ValidationPipe.

## Módulos Relacionados

Este arquivo contém as regras fundamentais do NestJS. Para regras específicas, consulte:

- **nestjs-api.md**: Versionamento de API, controllers, DTOs, pipes, guards, interceptors, tratamento de exceções e Swagger/OpenAPI
- **nestjs-testing.md**: Testes unitários, testes de integração, mocks e cobertura
- **nestjs-checklist.md**: Checklist consolidado para verificação antes de commit
- **postgresql.md**: Regras específicas do PostgreSQL (design de schema, nomenclatura, performance, migrations)
