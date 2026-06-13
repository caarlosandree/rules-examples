---
trigger: model_decision
description: Regras para testes em projetos Java/Spring Boot, incluindo JUnit 5, Mockito, Testcontainers, testes unitários, testes de integração, factories e cobertura.
globs: **/*.java
---

# Regras de Desenvolvimento - Testes em Java

## Visão Geral

- Escreva testes como parte do desenvolvimento, não como afterthought
- Testes devem ser confiáveis, determinísticos e rápidos
- Um teste deve falhar por apenas um motivo
- Use nomes descritivos que expliquem o comportamento esperado
- Organize testes em arrange/act/assert (given/when/then)

## Ferramentas de Teste

Stack de testes de referência:

- **JUnit 5** (Jupiter) como framework principal
- **Mockito** para mocks e espias
- **AssertJ** para asserções fluentes
- **Spring Boot Test** para testes de integração
- **Testcontainers** para testes com banco de dados real
- **JaCoCo** para relatório de cobertura

## Testes Unitários

### Quando Escrever
- Teste lógica de negócio em services
- Teste mapeamentos (MapStruct) quando houver lógica customizada
- Teste validações customizadas
- Teste utilitários e helpers

### Estrutura

```java
// ✅ Bom: teste unitário organizado em Given/When/Then
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private StockService stockService;

    @InjectMocks
    private OrderService orderService;

    @Test
    void shouldCreateOrderWhenStockIsAvailable() {
        // Given
        CreateOrderRequest request = new CreateOrderRequest(1L, 2);
        Product product = ProductFactory.withStock(10);

        when(stockService.findById(1L)).thenReturn(product);
        when(orderRepository.save(any(Order.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        OrderDTO result = orderService.create(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.quantity()).isEqualTo(2);
        verify(stockService).decreaseStock(1L, 2);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void shouldThrowExceptionWhenStockIsInsufficient() {
        // Given
        CreateOrderRequest request = new CreateOrderRequest(1L, 20);
        Product product = ProductFactory.withStock(5);

        when(stockService.findById(1L)).thenReturn(product);

        // When / Then
        assertThatThrownBy(() -> orderService.create(request))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Estoque insuficiente");

        verify(orderRepository, never()).save(any(Order.class));
    }
}
```

### Boas Práticas
- Mock dependências externas (repositórios, serviços, gateways)
- Não teste comportamento do framework
- Use factories para criar objetos de teste
- Evite compartilhar estado entre testes
- Cada teste deve ser independente

## Testes de Integração

### Quando Escrever
- Teste controllers com `MockMvc`
- Teste repositories com `@DataJpaTest`
- Teste endpoints de ponta a ponta com banco real via Testcontainers
- Teste configurações de segurança

### Testes de Controller

```java
// ✅ Bom: teste de controller com MockMvc
@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @Test
    void shouldReturnUsersWhenGetAll() throws Exception {
        // Given
        when(userService.findAll()).thenReturn(List.of(
                new UserDTO(1L, "João Silva", "joao@empresa.com")
        ));

        // When / Then
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("João Silva"));
    }

    @Test
    void shouldReturnBadRequestWhenNameIsBlank() throws Exception {
        // Given
        String invalidRequest = """
                {"name": "", "email": "invalid", "password": "123"}
                """;

        // When / Then
        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequest))
                .andExpect(status().isBadRequest());
    }
}
```

### Testes de Repository

```java
// ✅ Bom: teste de repository com @DataJpaTest
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class UserRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private UserRepository userRepository;

    @Test
    @Transactional
    void shouldSaveAndRetrieveUserByEmail() {
        // Given
        User user = UserFactory.create("João Silva", "joao@empresa.com");
        userRepository.save(user);

        // When
        Optional<User> found = userRepository.findByEmail("joao@empresa.com");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("João Silva");
    }
}
```

## Testcontainers

- Use **Testcontainers** para testes que dependem de funcionalidades específicas do banco (JSONB, arrays, triggers, funções customizadas)
- Evite H2 quando o banco de produção for diferente
- Use containers compartilhados (`@Container static`) quando possível para reduzir tempo de execução
- Use imagens Alpine para containers menores e mais rápidos

```gradle
// ✅ Bom: dependências de Testcontainers no build.gradle
dependencies {
    testImplementation("org.testcontainers:testcontainers:1.20.0")
    testImplementation("org.testcontainers:postgresql:1.20.0")
    testImplementation("org.testcontainers:junit-jupiter:1.20.0")
}
```

```java
// ✅ Bom: configuração compartilhada de Testcontainers
@Testcontainers
@SpringBootTest
class OrderIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test")
            .withReuse(true);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    // ...
}
```

## Factories de Teste

- Use factories para centralizar a criação de objetos de teste
- Evite repetição de código de setup
- Permita customização via parâmetros opcionais

```java
// ✅ Bom: factory de teste
public final class UserFactory {

    private UserFactory() {}

    public static User create(String name, String email) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword("SenhaForte123");
        user.setActive(true);
        return user;
    }

    public static User createDefault() {
        return create("João Silva", "joao@empresa.com");
    }
}
```

## Cobertura de Testes

- Cobertura não é sinonimo de qualidade, mas é um indicador útil
- Meta mínima de referência: **80% de cobertura em lógica de negócio**
- Foque em cobrir caminhos críticos, edge cases e regras de negócio
- Não escreva testes apenas para aumentar a cobertura
- Configure JaCoCo para gerar relatórios e falhar abaixo do threshold

```xml
<!-- Exemplo de plugin JaCoCo no pom.xml -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.12</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

## Antipadrões a Evitar

```java
// ❌ Ruim: teste sem asserção significativa
@Test
void shouldCreateUser() {
    userService.create(request);
}

// ❌ Ruim: teste que depende de estado de outro teste
@Test
void shouldDeleteUser() {
    // assume que usuário foi criado no teste anterior
    userService.delete(1L);
}

// ❌ Ruim: teste com muitas asserções e responsabilidades
@Test
void shouldDoEverything() {
    // cria, lista, atualiza e deleta em um único teste
}
```

## Execução de Testes

- Execute testes unitários frequentemente durante o desenvolvimento
- Execute testes de integração antes de push ou em CI/CD
- Não execute testes automáticos em builds locais, salvo quando solicitado
- Para validar compilação, use `mvn compile` ou `./gradlew compileJava`

## Módulos Relacionados

- **java-core.md**: princípios fundamentais, estrutura e padrões Java/Spring
- **java-api.md**: testes de controllers, validação e documentação de API
- **java-checklist.md**: checklist pré-commit para projetos Java
