---
trigger: always_on
description: Regras para desenvolvimento de APIs REST com NestJS: controllers, versionamento, DTOs, pipes, guards, interceptors, tratamento de exceções, Swagger/OpenAPI e status HTTP.
globs: **/*.{ts,js}
---
# Regras de Desenvolvimento - NestJS API

## Controllers REST

- Use `@Controller()` para definir rotas e agrupar endpoints
- Mantenha controllers finos: validação básica, DTOs e delegação para services
- Nunca coloque lógica de negócio complexa no controller
- Retorne DTOs de resposta, nunca entidades do banco diretamente
- Use os métodos HTTP semânticos: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- Evite aninhar muitos sub-recursos; prefira queries claras ou recursos próprios

```typescript
// ✅ Bom
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(
    @Query() query: FindOrdersQueryDto,
  ): Promise<PaginatedResponse<OrderResponseDto>> {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.ordersService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.ordersService.create(dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateStatus(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.ordersService.remove(id);
  }
}
```

```typescript
// ❌ Ruim: lógica de negócio no controller
@Controller('orders')
export class OrdersController {
  @Post()
  async create(@Body() dto: CreateOrderDto) {
    const user = await this.usersRepository.findById(dto.userId);
    if (!user) throw new NotFoundException();
    const order = await this.ordersRepository.create({ ...dto });
    await this.emailService.send(order);
    return order;
  }
}
```

## Versionamento de API

- Use versionamento explícito via URI (`/v1/users`) ou header (`Accept-Version`)
- Prefira versionamento por URI para clareza e facilidade de cache
- Configure versionamento global no `main.ts`
- Evite breaking changes em versões estáveis
- Documente versões no Swagger

```typescript
// ✅ Bom: Versionamento por URI no main.ts
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
  prefix: 'v',
});
```

```typescript
// ✅ Bom: Controller versionado
@Controller({ path: 'users', version: '1' })
export class UsersControllerV1 {
  // endpoints v1
}

@Controller({ path: 'users', version: '2' })
export class UsersControllerV2 {
  // endpoints v2
}
```

## DTOs

- Use classes para DTOs de entrada e saída
- Valide DTOs de entrada com `class-validator`
- Use DTOs de resposta para controlar o que é exposto na API
- Use `PartialType`, `OmitType`, `PickType` e `IntersectionType` do `@nestjs/mapped-types` para evitar duplicação
- Evite reutilizar DTOs de entrada como resposta

```typescript
// ✅ Bom: DTOs separados para entrada e saída
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.createdAt = user.createdAt;
  }
}
```

```typescript
// ✅ Bom: Reuso com mapped-types
export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

```typescript
// ❌ Ruim: expor entidade diretamente
@Get(':id')
async findOne(@Param('id') id: string): Promise<User> {
  return this.usersRepository.findById(id);
}
```

## Pipes

- Use `ValidationPipe` globalmente para validar e transformar DTOs
- Crie pipes customizados para transformações específicas (ex: parse de UUID, enum)
- Use `ParseIntPipe`, `ParseUUIDPipe`, `ParseEnumPipe` dos módulos built-in
- Aplique pipes em controllers específicos quando necessário

```typescript
// ✅ Bom: ParseUUIDPipe em parâmetro
@Get(':id')
async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
  return this.usersService.findById(id);
}
```

```typescript
// ✅ Bom: Pipe customizado
@Injectable()
export class ParseStatusPipe implements PipeTransform<string, OrderStatus> {
  transform(value: string): OrderStatus {
    if (!Object.values(OrderStatus).includes(value as OrderStatus)) {
      throw new BadRequestException(`Status ${value} inválido`);
    }
    return value as OrderStatus;
  }
}

@Get()
async findByStatus(
  @Query('status', ParseStatusPipe) status: OrderStatus,
): Promise<OrderResponseDto[]> {
  return this.ordersService.findByStatus(status);
}
```

## Guards

- Use guards para autorização e permissões
- Não coloque lógica de autenticação nos controllers
- Componha guards com `@UseGuards()`
- Implemente `CanActivate` corretamente

```typescript
// ✅ Bom
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

```typescript
// ✅ Bom: Uso no controller
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('reports')
  @Roles(Role.ADMIN)
  async getReports() {
    // ...
  }
}
```

## Interceptors

- Use interceptors para logging, transformação de resposta, cache e tratamento de timeout
- Evite lógica de negócio em interceptors
- Use interceptors globais para comportamentos cross-cutting
- Use `map` para transformar respostas e `catchError` para erros

```typescript
// ✅ Bom: Interceptor de transformação de resposta
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

```typescript
// ✅ Bom: Registro global
app.useGlobalInterceptors(new TransformInterceptor(), new TimeoutInterceptor());
```

## Tratamento de Exceções

- Use filtros de exceção para padronizar respostas de erro
- Crie exceções customizadas quando necessário
- Não exponha detalhes internos do sistema em produção
- Retorne mensagens claras e códigos HTTP adequados
- Use `HttpException` e subclasses built-in (`BadRequestException`, `NotFoundException`, etc.)

```typescript
// ✅ Bom: Filtro de exceção global
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Erro interno do servidor';

    this.logger.error(exception);

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
```

```typescript
// ✅ Bom: Exceção customizada
export class InsufficientFundsException extends HttpException {
  constructor() {
    super('Saldo insuficiente para realizar a transação', HttpStatus.PAYMENT_REQUIRED);
  }
}
```

## OpenAPI/Swagger

- Documente todos os endpoints com `@nestjs/swagger`
- Use `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`
- Descreva DTOs de resposta com `@ApiProperty`
- Mantenha a documentação sincronizada com o código
- Use autenticação no Swagger quando a API for protegida

```typescript
// ✅ Bom
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }
}
```

```typescript
// ✅ Bom: DTO documentado
export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'usuario@exemplo.com' })
  email: string;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  createdAt: Date;
}
```

## Status HTTP

- Use status HTTP semânticos
- `200 OK` para consultas e atualizações bem-sucedidas
- `201 Created` para criação de recursos
- `204 No Content` para deleções ou respostas vazias intencionais
- `400 Bad Request` para dados inválidos
- `401 Unauthorized` para autenticação ausente ou inválida
- `403 Forbidden` para permissão insuficiente
- `404 Not Found` para recursos inexistentes
- `409 Conflict` para conflitos de estado (ex: recurso duplicado)
- `422 Unprocessable Entity` para regras de negócio violadas
- `500 Internal Server Error` para erros inesperados

```typescript
// ✅ Bom
@Post()
@HttpCode(HttpStatus.CREATED)
async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
  return this.usersService.create(dto);
}

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
async remove(@Param('id') id: string): Promise<void> {
  await this.usersService.remove(id);
}
```

## Respostas Padronizadas

- Use uma estrutura consistente de resposta para sucesso e erro
- Inclua metadados de paginação em listas
- Evite retornar `null` sem contexto; use arrays vazios ou mensagens claras

```typescript
// ✅ Bom: Resposta paginada
export class PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}
```

## Módulos Relacionados

- **nestjs-core.md**: Stack, princípios, estrutura, nomenclatura, formatação e padrões NestJS
- **nestjs-testing.md**: Testes unitários, testes de integração e cobertura
- **nestjs-checklist.md**: Checklist pré-commit para projetos NestJS
