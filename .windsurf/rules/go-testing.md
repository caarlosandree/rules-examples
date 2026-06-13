---
trigger: always_on
description: Regras para testes em Go: testing padrão, testify, table-driven tests, mocks, testes de integração e cobertura.
globs: **/*.go
---
# Regras de Desenvolvimento - Go Testing

## Stack Tecnológica

Este documento aplica-se a testes escritos em Go usando:
- **`testing`** padrão do Go
- **`stretchr/testify`** (`assert`, `require`, `mock`, `suite`)
- **`testify/mock`** ou **geração manual de mocks** para interfaces
- **Testcontainers** ou bancos de teste efêmeros para integração
- **`go test`**, **`go test -race`**, **`go test -cover`**

## Princípios Gerais

### Testes como Documentação
- Testes devem explicar o comportamento esperado do código
- Nomeie testes de forma descritiva: `Test<Função>_<Cenário>_<ResultadoEsperado>`
- Mantenha testes independentes entre si
- Um teste deve falhar por apenas um motivo

### Pirâmide de Testes
- Priorize testes unitários rápidos e isolados
- Use testes de integração para validar interação com banco, filas e APIs externas
- Mantenha testes E2E raros e bem justificados

### Determinismo
- Testes devem ser determinísticos: mesma entrada → mesma saída
- Não dependam de ordem de execução
- Não dependam de data/hora real; use clocks injetáveis
- Limpe dados entre testes de integração

## Estrutura de Testes

### Nomenclatura
- Arquivos de teste: `*_test.go`
- Pacote de teste: geralmente `pacote` (testa código interno) ou `pacote_test` (testa API pública)
- Funções de teste: `Test<Nome>_<Cenario>_<Esperado>`
- Helpers: nome começando com minúscula e sem prefixo `Test`

### Teste Básico
```go
// internal/user/service_test.go
package user

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestService_GetByID_Success(t *testing.T) {
	repo := &mockRepository{
		getByIDFunc: func(ctx context.Context, id string) (*User, error) {
			return &User{ID: "123", Name: "Ana"}, nil
		},
	}
	svc := NewService(repo)

	user, err := svc.GetByID(context.Background(), "123")

	require.NoError(t, err)
	assert.Equal(t, "Ana", user.Name)
}

func TestService_GetByID_NotFound(t *testing.T) {
	repo := &mockRepository{
		getByIDFunc: func(ctx context.Context, id string) (*User, error) {
			return nil, ErrNotFound
		},
	}
	svc := NewService(repo)

	_, err := svc.GetByID(context.Background(), "999")

	assert.ErrorIs(t, err, ErrNotFound)
}
```

## Table-Driven Tests

Use table-driven tests para múltiplos cenários de uma mesma função:

```go
func TestValidateCreateUserRequest(t *testing.T) {
	tests := []struct {
		name    string
		req     CreateUserRequest
		wantErr bool
	}{
		{
			name:    "válido",
			req:     CreateUserRequest{Name: "Ana", Email: "ana@example.com"},
			wantErr: false,
		},
		{
			name:    "nome curto",
			req:     CreateUserRequest{Name: "A", Email: "ana@example.com"},
			wantErr: true,
		},
		{
			name:    "e-mail inválido",
			req:     CreateUserRequest{Name: "Ana", Email: "invalid"},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateCreateUserRequest(tt.req)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
```

### Boas Práticas em Table-Driven Tests
- Sempre use `t.Run` para nomear subtestes
- Evite compartilhar estado entre iterações
- Use `tt := tt` se precisar capturar a variável em goroutines

## Mocks

### Mock Manual por Interface
```go
// internal/user/service_test.go
type mockRepository struct {
	getByIDFunc func(ctx context.Context, id string) (*User, error)
	saveFunc    func(ctx context.Context, u *User) error
}

func (m *mockRepository) GetByID(ctx context.Context, id string) (*User, error) {
	return m.getByIDFunc(ctx, id)
}

func (m *mockRepository) Save(ctx context.Context, u *User) error {
	return m.saveFunc(ctx, u)
}
```

### Mock com Testify
```go
import "github.com/stretchr/testify/mock"

type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) GetByID(ctx context.Context, id string) (*User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*User), args.Error(1)
}

// Uso no teste
func TestService_GetByID_MockTestify(t *testing.T) {
	repo := new(MockRepository)
	repo.On("GetByID", mock.Anything, "123").Return(&User{ID: "123", Name: "Ana"}, nil)

	svc := NewService(repo)
	user, err := svc.GetByID(context.Background(), "123")

	require.NoError(t, err)
	assert.Equal(t, "Ana", user.Name)
	repo.AssertExpectations(t)
}
```

### Regras para Mocks
- Mock somente interfaces que você possui ou controla
- Não mock bibliotecas de terceiros diretamente — crie adaptadores
- Verifique expectativas no final do teste
- Mantenha mocks próximos aos testes ou em `internal/mocks/`

## Testes de Integração

### Estrutura
```go
// tests/integration/user_repository_test.go
package integration

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/seudominio/aplicacao/internal/infra/db"
)

func TestUserRepository_CreateAndGet(t *testing.T) {
	if testing.Short() {
		t.Skip("pulando teste de integração")
	}

	ctx := context.Background()
	conn := setupTestDB(t)
	defer teardownTestDB(t, conn)

	repo := db.NewUserRepository(conn)

	user := &domain.User{Name: "Ana", Email: "ana@example.com"}
	err := repo.Save(ctx, user)
	require.NoError(t, err)

	found, err := repo.GetByID(ctx, user.ID)
	require.NoError(t, err)
	require.Equal(t, user.Email, found.Email)
}
```

### Setup e Teardown
```go
func setupTestDB(t *testing.T) *sql.DB {
	t.Helper()
	conn, err := sql.Open("pgx", os.Getenv("TEST_DATABASE_URL"))
	require.NoError(t, err)
	t.Cleanup(func() { _ = conn.Close() })
	return conn
}
```

### Testes com Testcontainers
```go
func TestMain(m *testing.M) {
	ctx := context.Background()
	req := testcontainers.ContainerRequest{
		Image:        "postgres:16-alpine",
		ExposedPorts: []string{"5432/tcp"},
		Env: map[string]string{
			"POSTGRES_USER":     "test",
			"POSTGRES_PASSWORD": "test",
			"POSTGRES_DB":       "testdb",
		},
		WaitingFor: wait.ForListeningPort("5432/tcp"),
	}
	pg, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		log.Fatalf("falha ao iniciar postgres: %v", err)
	}
	defer pg.Terminate(ctx)

	os.Exit(m.Run())
}
```

## Cobertura

### Executar Cobertura
```bash
# Cobertura básica
go test ./... -cover

# Cobertura detalhada
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out -o coverage.html

# Cobertura com race detector
go test ./... -race -cover
```

### Meta de Cobertura
- Mínimo de **70%** para projetos novos
- Mínimo de **80%** para código crítico de negócio
- Cobertura não substitui qualidade de testes — evite testes vazios apenas para aumentar porcentagem

## Race Detector

Sempre execute testes com race detector em pipelines:
```bash
go test ./... -race
```

Evite:
- Compartilhamento de variáveis em loops de goroutines sem shadowing
- Acesso não sincronizado a maps e slices compartilhados

```go
// ❌ Ruim: variável compartilhada no loop
for _, item := range items {
	go func() {
		process(item) // item pode ser o último valor
	}()
}

// ✅ Bom: shadowing seguro
for _, item := range items {
	item := item
	go func() {
		process(item)
	}()
}
```

## Testes HTTP

### Usando httptest
```go
package user

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestHandler_Create(t *testing.T) {
	svc := &mockService{createFunc: func(ctx context.Context, req CreateUserRequest) (*User, error) {
		return &User{ID: "1", Name: req.Name, Email: req.Email}, nil
	}}
	h := NewHandler(svc)

	body, _ := json.Marshal(CreateUserRequest{Name: "Ana", Email: "ana@example.com"})
	req := httptest.NewRequest(http.MethodPost, "/users", bytes.NewReader(body))
	rec := httptest.NewRecorder()

	h.Create(rec, req)

	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.Contains(t, rec.Body.String(), "Ana")
}
```

## Benchmarks

Crie benchmarks para funções críticas de performance:

```go
func BenchmarkParseCSV(b *testing.B) {
	data := generateLargeCSV()
	for i := 0; i < b.N; i++ {
		_, err := ParseCSV(data)
		if err != nil {
			b.Fatal(err)
		}
	}
}
```

## Padrões a Evitar

- ❌ Testes que dependem de ordem de execução
- ❌ Testes que acessam serviços externos reais
- ❌ `time.Sleep` para sincronização; use canais ou `sync.WaitGroup`
- ❌ Testes sem assertivas significativas
- ❌ Lógica condicional complexa dentro de testes

## Checklist de Testes

- [ ] Cada função pública crítica possui testes
- [ ] Cenários de erro estão cobertos
- [ ] Table-driven tests são usados para múltiplos cenários
- [ ] Mocks são limpos e verificados
- [ ] Testes de integração rodam isoladamente com `testing.Short()`
- [ ] Race detector passa sem alertas
- [ ] Cobertura atinge a meta do projeto

## Docs Oficiais
- testing - https://pkg.go.dev/testing
- testify - https://github.com/stretchr/testify
- Testcontainers Go - https://golang.testcontainers.org/

## Módulos Relacionados

- **go-core.md**: Princípios gerais, estrutura de pastas, nomenclatura e formatação
- **go-api.md**: APIs HTTP, handlers, middlewares, DTOs e logging
- **go-checklist.md**: Checklist consolidado para verificação antes de commit
