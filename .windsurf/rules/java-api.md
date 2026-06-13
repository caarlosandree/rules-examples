---
trigger: model_decision
description: Regras para desenvolvimento de APIs REST em Java/Spring Boot, incluindo versionamento, controllers, DTOs, validação Jakarta, tratamento de exceções, OpenAPI/Swagger, status HTTP e paginação.
globs: **/*.java
---

# Regras de Desenvolvimento - API REST em Java

## Versionamento de API

### Estratégia de Versionamento
- **Sempre** versione endpoints públicos da API
- Use **path versioning** como padrão: `/api/v{versao}/recurso`
- A versão atual deve ser a mais recente e estável
- Mantenha versões antigas funcionando durante período de transição
- Documente breaking changes entre versões no changelog da API

```java
// ✅ Bom: versionamento por path
@RestController
@RequestMapping("/api/v1/users")
public class UserControllerV1 {
    // ...
}

@RestController
@RequestMapping("/api/v2/users")
public class UserControllerV2 {
    // ...
}
```

### Boas Práticas
- Use DTOs específicos por versão quando o contrato mudar
- Prefira compatibilidade retroativa (adição de campos opcionais)
- Deprecie versões antigas antes de removê-las
- Documente mudanças no changelog
- Headers de versionamento (`Accept-Version`, custom headers) podem ser usados como alternativa, mas path versioning é o padrão

## Estrutura de Controllers

### Regras Gerais
- Controllers devem ser finos: recebem a requisição, validam entrada, delegam para o service e retornam a resposta
- Não coloque lógica de negócio no controller
- Use injeção de dependências por construtor
- Retorne `ResponseEntity<T>` para controle explícito de status HTTP
- Use DTOs para requests e responses

```java
package com.empresa.projeto.modules.user.controller;

import com.empresa.projeto.modules.user.dto.CreateUserRequest;
import com.empresa.projeto.modules.user.dto.UserDTO;
import com.empresa.projeto.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Usuários", description = "Endpoints para gerenciamento de usuários")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Lista usuários", description = "Retorna todos os usuários cadastrados")
    public ResponseEntity<List<UserDTO>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PostMapping
    @Operation(summary = "Cria usuário", description = "Cria um novo usuário no sistema")
    public ResponseEntity<UserDTO> create(@Valid @RequestBody CreateUserRequest request) {
        UserDTO created = userService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
```

### Evite Repetição (DRY)
- Extraia validações e mapeamentos comuns para serviços ou mappers
- Crie handlers globais para tratamento de exceções
- Reutilize DTOs de resposta de erro

```java
// ✅ Bom: handler global de erro reutilizável
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Recurso não encontrado",
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
```

## DTOs (Data Transfer Objects)

- Use DTOs para requests e responses
- Prefira `record` para DTOs imutáveis
- Use validações Jakarta nos DTOs de entrada
- Use `@Schema` para documentar campos no OpenAPI
- Não exponha entidades JPA diretamente

```java
// ✅ Bom: DTO de request com validação
public record CreateUserRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 3, max = 100, message = "Nome deve ter entre 3 e 100 caracteres")
        @Schema(description = "Nome completo do usuário", example = "João Silva")
        String name,

        @NotBlank(message = "Email é obrigatório")
        @Email(message = "Email deve ser válido")
        @Schema(description = "Email do usuário", example = "joao@empresa.com")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
        @Schema(description = "Senha do usuário", example = "SenhaForte123")
        String password
) {}

// ✅ Bom: DTO de response
public record UserDTO(
        @Schema(description = "ID do usuário", example = "1")
        Long id,

        @Schema(description = "Nome do usuário", example = "João Silva")
        String name,

        @Schema(description = "Email do usuário", example = "joao@empresa.com")
        String email
) {}
```

## Validação de Entradas

- **Sempre** valide dados de entrada do usuário
- Use Bean Validation (`@NotNull`, `@NotBlank`, `@Size`, `@Email`, etc.) nos DTOs
- Use `@Valid` no controller para acionar a validação
- Forneça mensagens de erro claras e específicas
- Valide regras de negócio no service quando necessário

```java
// ✅ Bom: validação completa no DTO e controller
@PostMapping
public ResponseEntity<UserDTO> create(
        @Valid @RequestBody CreateUserRequest request) {
    // ...
}

// ❌ Ruim: validação manual e redundante
@PostMapping
public ResponseEntity<UserDTO> create(@RequestBody CreateUserRequest request) {
    if (request.name() == null || request.name().isBlank()) {
        throw new BadRequestException("Nome é obrigatório");
    }
    // ...
}
```

## Tratamento de Exceções

- Use `@RestControllerAdvice` ou `@ControllerAdvice` para tratamento global
- Crie exceções customizadas para casos de negócio
- Retorne códigos HTTP adequados
- Não exponha informações sensíveis ou detalhes internos em produção
- Logue erros para debug, mas sem vazar dados confidenciais

```java
// ✅ Bom: tratamento global de exceções
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(
            GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Recurso não encontrado",
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();

        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Erro de validação",
                errors
        );
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Erro inesperado: ", ex);
        ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Erro interno",
                "Ocorreu um erro inesperado. Tente novamente mais tarde."
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

// ❌ Ruim: ignorar exceção
try {
    userRepository.save(user);
} catch (Exception e) {
    // ignorado
}
```

### Códigos HTTP de Uso Comum

| Situação | Status HTTP |
|----------|-------------|
| Sucesso na listagem | `200 OK` |
| Recurso criado | `201 Created` |
| Requisição aceita para processamento assíncrono | `202 Accepted` |
| Sem conteúdo (deleção bem-sucedida) | `204 No Content` |
| Requisição inválida | `400 Bad Request` |
| Autenticação necessária | `401 Unauthorized` |
| Sem permissão | `403 Forbidden` |
| Recurso não encontrado | `404 Not Found` |
| Conflito de estado | `409 Conflict` |
| Erro interno do servidor | `500 Internal Server Error` |
| Serviço indisponível | `503 Service Unavailable` |

## Transações em APIs

- Use `@Transactional` em métodos de service, nunca em controllers
- Use `@Transactional(readOnly = true)` como padrão na classe de service
- Métodos que escrevem devem ter `@Transactional`
- Evite chamadas externas (HTTP, filas) dentro de transações

```java
@Service
@Transactional(readOnly = true)
public class OrderService {

    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request) {
        // ...
    }

    public List<OrderDTO> findAll() {
        // ...
    }
}
```

## Paginação

- Sempre use paginação para endpoints que retornam listas grandes
- Use `Pageable` do Spring Data com `@PageableDefault`
- Retorne `Page<T>` ou `PageResponse<T>` com metadados
- Não retorne listas grandes sem limites

```java
// ✅ Bom: endpoint paginado
@GetMapping
public ResponseEntity<Page<UserDTO>> findAll(
        @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC)
        Pageable pageable) {
    return ResponseEntity.ok(userService.findAll(pageable));
}

// ❌ Ruim: listagem sem paginação
@GetMapping
public ResponseEntity<List<UserDTO>> findAll() {
    return ResponseEntity.ok(userService.findAll());
}
```

## Documentação com OpenAPI/Swagger

### Configuração
- Use **SpringDoc OpenAPI** para documentação automática
- Configure metadados da API (título, versão, descrição, contato)
- Configure servidores para dev/prod

```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API do Projeto")
                        .version("1.0.0")
                        .description("Documentação da API REST")
                        .contact(new Contact()
                                .name("Equipe de Desenvolvimento")
                                .email("dev@empresa.com")))
                .servers(List.of(
                        new Server().url("http://localhost:8080")
                                .description("Ambiente local"),
                        new Server().url("https://api.empresa.com")
                                .description("Produção")
                ));
    }
}
```

### Anotações nos Controllers
- Use `@Tag` para agrupar endpoints
- Use `@Operation` para descrever cada endpoint
- Use `@ApiResponse` para documentar respostas possíveis
- Use `@Schema` para documentar campos dos DTOs

```java
@GetMapping("/{id}")
@Operation(
        summary = "Busca usuário por ID",
        description = "Retorna os dados de um usuário específico",
        responses = {
                @ApiResponse(responseCode = "200", description = "Usuário encontrado"),
                @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
        }
)
public ResponseEntity<UserDTO> findById(
        @Parameter(description = "ID do usuário", example = "1")
        @PathVariable Long id) {
    return ResponseEntity.ok(userService.findById(id));
}
```

### Configuração no application.yml

```yaml
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    operations-sorter: method
    tags-sorter: alpha
```

## Segurança Básica de Endpoints

- Proteja endpoints sensíveis com Spring Security
- Use anotações como `@PreAuthorize` quando apropriado
- Evite expor IDs sequenciais quando possível; considere UUIDs para recursos públicos
- Valide permissões no service quando a lógica for complexa

```java
// ✅ Bom: proteção de endpoint
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{id}")
public ResponseEntity<Void> delete(@PathVariable Long id) {
    userService.delete(id);
    return ResponseEntity.noContent().build();
}
```

## Módulos Relacionados

- **java-core.md**: princípios fundamentais, estrutura, nomenclatura, formatação e padrões Java/Spring
- **java-testing.md**: testes de controllers, services e integração
- **java-checklist.md**: checklist pré-commit para projetos Java
