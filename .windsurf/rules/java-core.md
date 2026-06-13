---
trigger: always_on
description: Regras fundamentais de desenvolvimento Java e Spring Boot, incluindo stack, princípios, estrutura de pastas, nomenclatura, formatação, padrões de código, injeção de dependências, transações, variáveis de ambiente, git/commits, documentação e restrições operacionais.
globs: **/*.java
---

# Regras de Desenvolvimento - Java Core

## Stack Tecnológica

Estas regras aplicam-se a projetos Java modernos. Stack de referência:

- **Java 21+** (LTS) como versão mínima da linguagem e da JVM
- **Maven 3.9+** ou **Gradle 8+** como ferramenta de build
- **Spring Boot 3.x** com **Jakarta EE** (`jakarta.*`) como framework principal
- **Spring Web** para APIs REST
- **Spring Data JPA** para persistência relacional
- **Spring Security** para autenticação, autorização e proteção de endpoints
- **Jakarta Bean Validation** para validação declarativa de dados
- **Flyway** ou **Liquibase** para controle de migrations de banco de dados
- **PostgreSQL** como banco relacional de referência
- **MapStruct** para mapeamento Entity ↔ DTO
- **Lombok** (opcional) para redução de boilerplate
- **SpringDoc OpenAPI** para documentação automática da API
- **Micrometer + OpenTelemetry** para observabilidade

Adapte as versões e ferramentas ao projeto, mas mantenha os princípios, padrões e convenções deste documento.

## Princípios Gerais

### Código Limpo e Legível
- Escreva código que seja fácil de entender para você e para quem mantê-lo no futuro
- Priorize clareza sobre concisão quando necessário
- Use nomes descritivos que expliquem o propósito e a intenção
- Siga os princípios **SOLID**, **DRY** e **KISS**

### Consistência
- Mantenha o mesmo estilo de codificação em todo o projeto
- Siga as convenções oficiais do Java (Java Code Conventions)
- Use as mesmas convenções de nomenclatura em arquivos relacionados
- Não misture estilos de formatação dentro de um mesmo módulo

### Programação para Manutenção
- Métodos pequenos, com responsabilidade única e propósito claro
- Evite classes gigantes; divida responsabilidades
- Documente decisões complexas ou não óbvias, não o óbvio
- Facilite a localização e correção de bugs

## Organização e Estrutura

### Estrutura de Pastas

Prefira **Package by Feature** em projetos médios e grandes. Organize por domínio de negócio, não por camada técnica.

```
src/main/java/com/empresa/projeto/
  ├── ProjetoApplication.java
  ├── config/                       # Configurações cross-cutting
  │   ├── JacksonConfig.java
  │   ├── OpenApiConfig.java
  │   └── SecurityConfig.java
  ├── shared/                       # Código reutilizável entre módulos
  │   ├── exception/
  │   ├── dto/
  │   ├── util/
  │   └── mapper/
  └── modules/                      # Package by Feature
      ├── user/
      │   ├── controller/
      │   ├── service/
      │   ├── repository/
      │   ├── dto/
      │   ├── mapper/
      │   ├── model/
      │   └── exception/
      ├── order/
      ├── product/
      └── notification/
```

**Benefícios do Package by Feature:**
- **Coesão**: classes relacionadas ficam próximas
- **Modularização**: facilita extração futura para microsserviços
- **Escalabilidade**: evita gavetas de bagunça em projetos grandes
- **Manutenibilidade**: desenvolvedores encontram código relacionado mais rapidamente

Projetos pequenos podem usar Package by Layer (`controller/`, `service/`, `repository/`), mas migre para Package by Feature assim que o domínio crescer.

### Nomenclatura

#### Arquivos e Pacotes
- Pacotes: **lowercase**, palavras separadas por ponto
  - ✅ `com.empresa.projeto.modules.user.controller`
  - ❌ `com.empresa.projeto.modules.User.Controller`
- Classes e interfaces: **PascalCase**
  - ✅ `UserController.java`, `UserService.java`, `UserRepository.java`
- Interfaces de serviço e repositório: **PascalCase**, sem prefixo `I`
  - ✅ `UserService`, `UserRepository`
  - ❌ `IUserService`, `IUserRepository`
- Classes de teste: sufixo `Test`
  - ✅ `UserServiceTest.java`
  - ❌ `TestUserService.java`

#### Variáveis e Métodos
- Variáveis e métodos: **camelCase**
  - ✅ `userName`, `findById()`, `calculateTotalPrice()`
  - ❌ `user_name`, `find_by_id()`, `calc()`
- Constantes: **UPPER_SNAKE_CASE**
  - ✅ `MAX_RETRY_ATTEMPTS`, `DEFAULT_PAGE_SIZE`
- Enums: **PascalCase** para o tipo, **UPPER_SNAKE_CASE** para os valores
  ```java
  public enum OrderStatus {
      PENDING,
      PAID,
      SHIPPED,
      CANCELLED
  }
  ```

#### Nomes Descritivos
- ✅ Bom: `getUserById()`, `isEmailAvailable()`, `calculateDiscountFor()`
- ❌ Ruim: `get()`, `process()`, `flag()`, `x`, `data`, `temp`

### Organização do Código

#### Estrutura de Services

```java
package com.empresa.projeto.modules.user.service;

import com.empresa.projeto.modules.user.dto.UserDTO;
import com.empresa.projeto.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    public List<UserDTO> findAll() {
        return userRepository.findAll().stream()
                .map(userMapper::toDTO)
                .toList();
    }
}
```

#### Funções e Métodos
- Mantenha métodos pequenos; idealmente até ~50 linhas
- Se um método faz mais de uma coisa, divida-o
- Use métodos auxiliares privados para lógica complexa
- Evite muitos níveis de aninhamento; extraia early returns quando apropriado
- Trate exceções explicitamente; nunca ignore exceções silenciosamente

## Indentação e Formatação

- Use **4 espaços** para indentação (padrão do Java)
- Limite máximo de **120 caracteres** por linha
- Use aspas duplas para strings
- Configure o IDE para remover imports não utilizados automaticamente
- Configure o build para executar formatação automática, se possível

### Ferramentas de Qualidade
- Use **Checkstyle** para validar estilo e limites de linha
- Use **SpotBugs** ou **Spotless** para análise estática
- Configure o build para falhar em violações graves de estilo

```xml
<!-- Exemplo de plugin Checkstyle no pom.xml -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-checkstyle-plugin</artifactId>
    <version>3.5.0</version>
    <configuration>
        <configLocation>checkstyle.xml</configLocation>
        <consoleOutput>true</consoleOutput>
        <failsOnError>true</failsOnError>
    </configuration>
</plugin>
```

## Comentários

### Comentários de Arquivo

Use JavaDoc no nível de pacote quando o pacote tiver responsabilidade significativa:

```java
/**
 * Pacote responsável pelo gerenciamento de usuários do sistema.
 * Controllers, services, repositórios e DTOs relacionados ao domínio de usuário.
 */
package com.empresa.projeto.modules.user;
```

### Comentários no Código
- Comente o **porquê**, não o **o quê**
- Comente lógica complexa ou não óbvia
- Evite comentários redundantes
- Use JavaDoc para métodos e classes públicos

```java
// ✅ Bom: explica o porquê
// Usamos transação para garantir atomicidade entre pedido e estoque
@Transactional
public Order createOrder(CreateOrderRequest request) {
    // ...
}

// ❌ Ruim: redundante
// Incrementa o contador
count++;
```

## Padrões Específicos de Java

- Siga as convenções oficiais do Java
- Prefira composição sobre herança
- Use interfaces para desacoplar dependências
- Use `enum` para conjuntos fixos de constantes relacionadas
- Use `Optional<T>` para valores que podem estar ausentes
- Evite `null` desnecessário; retorne `Optional` ou coleções vazias
- Prefira `var` apenas quando o tipo for óbvio à direita

```java
// ✅ Bom: Optional para valor opcional
public Optional<User> findByEmail(String email) {
    return userRepository.findByEmail(email);
}

// ❌ Ruim: retornar null
public User findByEmail(String email) {
    return userRepository.findByEmail(email); // pode retornar null
}
```

## Padrões Específicos de Spring Boot

### Injeção de Dependências
- Use **injeção por construtor** (obrigatório para classes de negócio)
- Evite `@Autowired` em campos
- Em classes com muitas dependências, avalie se a classe não está acumulando responsabilidades

```java
// ✅ Bom: DI por construtor
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final StockService stockService;
    private final PaymentGateway paymentGateway;

    public OrderService(
            OrderRepository orderRepository,
            StockService stockService,
            PaymentGateway paymentGateway) {
        this.orderRepository = orderRepository;
        this.stockService = stockService;
        this.paymentGateway = paymentGateway;
    }
}

// ❌ Ruim: @Autowired em campo
@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
}
```

### Configuração e Profiles
- Use `@Configuration` para classes de configuração
- Separe configurações por ambiente usando profiles
- Aproveite a auto-configuração do Spring Boot
- Use `@ConditionalOnProperty` para funcionalidades opcionais

```yaml
# application-dev.yml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}

# application-prod.yml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
```

### DTOs e Entidades
- **Sempre** retorne DTOs nos controllers; nunca exponha entidades JPA diretamente
- Use `record` para DTOs imutáveis quando possível
- Use MapStruct para mapeamento Entity ↔ DTO
- Mantenha entidades JPA enxutas, sem lógica de negócio complexa

```java
// ✅ Bom: DTO imutável com record
public record UserDTO(
        Long id,
        String name,
        String email
) {}

// ❌ Ruim: expondo entidade JPA no controller
@GetMapping("/{id}")
public User getUser(@PathVariable Long id) { // User é @Entity
    return userRepository.findById(id).orElseThrow();
}
```

### Transações
- Anote services com `@Transactional(readOnly = true)` no nível da classe
- Use `@Transactional` (escrita) em métodos que modificam dados
- Evite transações longas e chamadas externas dentro de transações
- Não anote controllers com `@Transactional`

```java
@Service
@Transactional(readOnly = true)
public class OrderService {

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        // ...
    }

    public List<OrderDTO> findAll() {
        // ...
    }
}
```

## Build e Dependências

### Maven
- Use `pom.xml` bem organizado com seções claras
- Centralize versões em `<properties>`
- Separe dependências por escopo (`compile`, `test`, `provided`, `runtime`)
- Use o BOM do Spring Boot para gerenciar versões compatíveis

### Gradle
- Prefira `build.gradle.kts` (Kotlin DSL) para projetos novos
- Use version catalogs (`gradle/libs.versions.toml`) para gerenciar versões
- Organize dependências por escopo (`implementation`, `testImplementation`, etc.)

```kotlin
// ✅ Bom: build.gradle.kts
plugins {
    java
    id("org.springframework.boot") version "3.3.x"
    id("io.spring.dependency-management") version "1.1.x"
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0")

    runtimeOnly("org.postgresql:postgresql")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.testcontainers:postgresql")
}
```

## Variáveis de Ambiente

- Use `application.yml` ou `application.properties` para configurações
- Documente todas as variáveis obrigatórias em um arquivo de exemplo
- Valide variáveis obrigatórias na inicialização quando apropriado
- Nunca commite segredos reais no repositório

```yaml
# ✅ Bom: configuração com variáveis de ambiente
app:
  jwt:
    secret: ${JWT_SECRET}
    expiration-hours: ${JWT_EXPIRATION_HOURS:24}
  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:3000}
```

```java
// ✅ Bom: validação na inicialização
@Configuration
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    @NotBlank(message = "JWT_SECRET é obrigatório")
    private String secret;

    @Min(1)
    private int expirationHours = 24;

    // getters e setters
}
```

## Git e Commits

- Faça commits atômicos: um commit = uma mudança lógica
- Use mensagens descritivas em português brasileiro
- Siga o padrão Conventional Commits: `tipo(escopo): descrição`
  - ✅ `feat(user): adiciona endpoint de busca por email`
  - ✅ `fix(order): corrige cálculo de desconto`
  - ✅ `refactor(product): extrai validação para service`
- Evite commits grandes e difíceis de revisar
- Não commite código comentado, arquivos de debug ou configurações locais

Para detalhes completos de commits, consulte o arquivo `commit.md` do repositório de regras.

## Documentação

- Mantenha o `README.md` atualizado com instruções de setup e execução
- Documente decisões arquiteturais importantes em ADRs ou documentos específicos
- Documente endpoints da API via OpenAPI/Swagger
- Documente breaking changes e versionamento da API
- Inclua um arquivo de exemplo de variáveis de ambiente

## Restrições Operacionais

- **Não inicie serviços locais** (`docker compose up`, `docker run`, `brew services start`) sem pedido explícito do usuário.
- **Migrations são imutáveis** após aplicadas em ambientes compartilhados. Nunca edite migrations já aplicadas; crie uma nova migration para corrigir ou alterar o schema.
- **Não execute testes automaticamente** em builds locais, salvo quando solicitado ou antes de push. Para validar compilação, use `mvn compile` ou `./gradlew compileJava`.
- **Não commite segredos**, credenciais ou arquivos de ambiente reais.

## Módulos Relacionados

- **java-api.md**: controllers REST, versionamento, DTOs, validação, tratamento de exceções, OpenAPI e paginação
- **java-testing.md**: JUnit 5, Mockito, Testcontainers, testes unitários e de integração
- **java-checklist.md**: checklist pré-commit para projetos Java
- **commit.md**: convenções de commits
