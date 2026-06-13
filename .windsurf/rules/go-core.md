---
trigger: always_on
description: Regras fundamentais de desenvolvimento Go: stack, princípios, estrutura de pastas, nomenclatura, formatação, padrões idiomáticos, tratamento de erros e módulos relacionados.
globs: **/*.go
---
# Regras de Desenvolvimento - Go Core

## Stack Tecnológica

Este projeto utiliza:
- **Go 1.23+** como linguagem de programação
- **Go Modules** (`go.mod` / `go.sum`) para gerenciamento de dependências
- **Padrão de layout** baseado em `cmd/`, `internal/`, `pkg/` e `api/`
- **Frameworks HTTP opcionais**: `net/http` padrão, **Gin**, **Echo** ou **Fiber**
- **Banco de dados**: PostgreSQL com `database/sql` + `lib/pq`/`pgx`, ou **sqlx** / **GORM** quando aprovado
- **Migrations**: `golang-migrate/migrate` ou `pressly/goose`
- **Validação**: `go-playground/validator` ou validação manual idiomática
- **Logging**: `log/slog` (padrão do Go 1.21+) ou `uber-go/zap`
- **Testes**: `testing` padrão + `stretchr/testify`
- **Observabilidade**: `expvar`/`net/http/pprof`, OpenTelemetry, Prometheus client
- **Configuração**: variáveis de ambiente com `joho/godotenv` + parsing estruturado (`envconfig` / `caarlos0/env`)
- **Containerização**: Dockerfile multi-stage

O módulo base do projeto é **`github.com/seudominio/aplicacao`** (substitua pelo módulo real do repo).

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
- Siga as convenções oficiais do Go (Effective Go, Go Code Review Comments)

### Programação para Manutenção
- Escreva código pensando em quem vai mantê-lo no futuro
- Documente decisões complexas ou não óbvias
- Facilite a localização e correção de bugs
- Mantenha funções pequenas e com responsabilidade única

## Organização e Estrutura

### Estrutura de Pastas

```
.
├── api/                   # Contratos de API: OpenAPI, protobuf, GraphQL schemas
├── cmd/                   # Pontos de entrada da aplicação (main.go por binário)
│   └── api/
│       └── main.go
├── internal/              # Código privado do projeto; não exportado para outros módulos
│   ├── config/            # Carregamento de configurações
│   ├── domain/            # Entidades, regras de negócio e interfaces de repositório
│   ├── infra/             # Implementações concretas (db, cache, fila, http client)
│   ├── modules/           # Package by Feature (opcional, para projetos maiores)
│   │   └── user/
│   │       ├── handler.go
│   │       ├── service.go
│   │       └── dto.go
│   └── shared/            # Utilitários cross-cutting (errors, logger, validator)
├── pkg/                   # Bibliotecas reutilizáveis e exportáveis entre projetos
│   └── httputil/
│       └── response.go
├── scripts/               # Scripts de automação (build, migrate, seed)
├── tests/                 # Fixtures, helpers e testes de integração globais
├── web/                   # Assets estáticos (se aplicável)
├── .golangci.yml          # Configuração do linter
├── Dockerfile
├── go.mod
├── go.sum
└── README.md
```

### Convenções de Pacotes
- **`cmd/`**: um subdiretório por executável. Cada um contém seu próprio `main.go`.
- **`internal/`**: código que não deve ser importado por outros módulos. O compilador do Go impõe isso quando o path contém `internal`.
- **`pkg/`**: somente para código genuinamente reutilizável. Se não for reutilizado fora do repo, mantenha em `internal/`.
- **`api/`**: contratos e schemas expostos ao mundo exterior.

### Package by Feature (recomendado para médios/grandes projetos)

```
internal/
  └── order/
      ├── handler.go      # HTTP handlers
      ├── service.go      # Casos de uso / lógica de negócio
      ├── repository.go   # Interface do repositório
      ├── dto.go          # Request/Response DTOs
      └── model.go        # Entidades de domínio
```

**Benefícios:**
- **Coesão**: arquivos relacionados ficam juntos
- **Modularização**: facilita extração futura para serviços separados
- **Escalabilidade**: evita "gavetas de bagunça"
- **Manutenibilidade**: desenvolvedores encontram código relacionado mais rapidamente

## Nomenclatura

### Arquivos e Pacotes
- Pacotes: **lowercase**, sem underscores ou hífens quando possível (ex: `user`, `orderrepo`, `httputil`)
- Arquivos: **snake_case.go** (ex: `user_handler.go`, `order_service.go`)
- Binários: nome do diretório em `cmd/`

### Tipos, Variáveis e Funções
- Tipos exportados: **PascalCase** (ex: `UserService`, `CreateOrderRequest`)
- Identificadores não exportados: **camelCase** (ex: `userService`, `createOrder`)
- Constantes: não há convenção rígida; use **PascalCase** se exportada ou **camelCase** se interna. Evite UPPER_SNAKE_CASE em Go.
- Interfaces: nome descritivo do comportamento, geralmente terminado em `-er` (ex: `Reader`, `Writer`, `Repository`)
- Nomes de pacote devem ser curtos e descritivos (ex: `user`, não `userservicepackage`)

#### Nomes Descritivos
- ✅ **Bom**: `GetUserByID`, `CalculateTotalPrice`, `IsUserAuthenticated`
- ❌ **Ruim**: `Get`, `Calc`, `Flag`, `x`, `data`, `temp`

### Organização do Código

#### Estrutura de Services
```go
// internal/user/service.go
package user

import (
	"context"
	"fmt"
)

// Repository define as operações de persistência de usuário.
type Repository interface {
	GetByID(ctx context.Context, id string) (*User, error)
	Save(ctx context.Context, u *User) error
}

// Service encapsula a lógica de negócio de usuários.
type Service struct {
	repo Repository
}

// NewService cria uma nova instância de Service.
func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

// GetByID retorna um usuário pelo ID.
func (s *Service) GetByID(ctx context.Context, id string) (*User, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("buscar usuário por id: %w", err)
	}
	return user, nil
}
```

#### Funções e Métodos
- Mantenha funções pequenas e com responsabilidade única
- Máximo de ~50 linhas por função quando possível
- Se uma função faz mais de uma coisa, divida-a
- Use funções auxiliares para lógica complexa
- Trate erros explicitamente — Go não tem exceções

## Indentação e Formatação
- Use **tabs** para indentação (padrão do Go; `gofmt` normaliza)
- Execute `gofmt` automaticamente no save ou pre-commit
- Use `goimports` para organizar imports automaticamente
- Mantenha linhas com máximo de **120 caracteres**
- Use `golangci-lint` para análise de código

### Ordem de Imports
Deixe `goimports`/`gofmt` organizar. Regra geral:
1. Pacotes padrão do Go
2. Pacotes de terceiros
3. Pacotes do próprio módulo

```go
import (
	"context"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/seudominio/aplicacao/internal/domain"
)
```

## Comentários

### Comentários de Pacote
```go
// Package user implementa os casos de uso e handlers do domínio de usuários.
package user
```

### Comentários no Código
- Comente apenas o **porquê**, não o **o quê**
- Comente lógica complexa ou não óbvia
- Evite comentários redundantes
- Documente tipos e funções exportados com comentário começando pelo nome

```go
// ✅ Bom: Explica o porquê
// Retry em 5xx porque a API upstream eventualmente se recupera após picos de carga.
func callUpstream(ctx context.Context) error { /* ... */ }

// ❌ Ruim: Redundante
// Incrementa o contador
count++
```

## Padrões Específicos do Stack

### Go Idiomático
- Prefira composição sobre herança (Go não tem herança de classes)
- Use `interfaces` implícitas: defina a interface onde é consumida, não onde é implementada
- Use `errors.New` para erros estáticos e `fmt.Errorf` com `%w` para wrapping
- Retorne `(T, error)` e trate o erro no chamador
- Use `context.Context` como primeiro parâmetro de funções que fazem I/O

```go
// ✅ Bom: Interface implícita definida pelo consumidor
type notifier interface {
	Notify(ctx context.Context, msg string) error
}

func SendReminder(ctx context.Context, n notifier, userID string) error { /* ... */ }

// ✅ Bom: Wrapping de erros
if err != nil {
	return fmt.Errorf("enviar lembrete para %s: %w", userID, err)
}
```

### Tratamento de Erros
- Nunca ignore erros: sempre verifique `if err != nil`
- Não use `panic` para fluxos de erro esperados; reserve para bugs irrecuperáveis
- Use sentinel errors (`var ErrNotFound = errors.New("não encontrado")`) para comparações
- Adicione contexto ao erro com `%w` para preservar a cadeia
- Para decisões baseadas em tipo de erro, use `errors.Is` ou `errors.As`

```go
// ✅ Bom: Tratamento idiomático
user, err := repo.GetByID(ctx, id)
if err != nil {
	if errors.Is(err, ErrNotFound) {
		return nil, ErrNotFound
	}
	return nil, fmt.Errorf("buscar usuário %s: %w", id, err)
}

// ❌ Ruim: Ignorar erro
_ = file.Close()

// ✅ Bom: Lidar com erro mesmo em defer
f, err := os.Open("data.csv")
if err != nil {
	return err
}
defer func() {
	if cerr := f.Close(); cerr != nil {
		err = errors.Join(err, cerr)
	}
}()
```

### Concorrência
- Use `sync.WaitGroup` e canais de forma clara
- Prefira `errgroup.Group` (golang.org/x/sync) quando múltiplas goroutines retornam erro
- Sempre proteja dados compartilhados com `sync.Mutex` ou canais
- Documente quem é responsável por fechar canais

```go
// ✅ Bom: errgroup para concorrência com cancelamento
g, ctx := errgroup.WithContext(ctx)
for _, id := range ids {
	id := id // shadow para captura segura
	g.Go(func() error {
		return processor.Process(ctx, id)
	})
}
if err := g.Wait(); err != nil {
	return fmt.Errorf("processar batch: %w", err)
}
```

## Variáveis de Ambiente
- Carregue configurações uma única vez na inicialização
- Valide variáveis obrigatórias antes de iniciar o servidor
- Use structs tipadas para configuração em vez de `os.Getenv` espalhado
- Documente todas as variáveis em `.env.example`

```go
// ✅ Bom: Config estruturada
package config

type Config struct {
	AppEnv   string `env:"APP_ENV" envDefault:"development"`
	HTTPPort int    `env:"HTTP_PORT" envDefault:"8080"`
	DBURL    string `env:"DATABASE_URL,required"`
}

func Load() (*Config, error) {
	var cfg Config
	if err := envconfig.Process("", &cfg); err != nil {
		return nil, fmt.Errorf("carregar configurações: %w", err)
	}
	return &cfg, nil
}
```

## Git e Commits
- Faça commits frequentes e atômicos
- Use mensagens de commit descritivas
- Um commit = uma mudança lógica
- Siga o padrão: `tipo: descrição curta` (ex: `feat: adiciona handler de usuários`)

**Nota**: Para padrões detalhados de commits, consulte o arquivo de regras `commit.md`.

## Documentação
- Mantenha o `README.md` atualizado com instruções de setup e desenvolvimento
- Documente decisões arquiteturais importantes em `docs/adr/`
- Inclua exemplos de uso para pacotes exportados em `pkg/`
- Documente endpoints da API usando OpenAPI/Swagger quando aplicável
- Documente breaking changes no changelog

## Docs Oficiais
- Effective Go - https://go.dev/doc/effective_go
- Go Code Review Comments - https://go.dev/wiki/CodeReviewComments
- Go Modules - https://go.dev/ref/mod
- Standard Library - https://pkg.go.dev/std
- Go by Example - https://gobyexample.com/

## Restrições Operacionais

- **Não ignore erros** — todo `err` deve ser verificado ou explicitamente descartado com justificativa em comentário.
- **Não use `panic`/`recover`** como mecanismo de controle de fluxo normal.
- **Não inicie serviços locais** (`docker compose up`, `docker run`, `brew services start`) sem pedido explícito do usuário.
- **Não rode `go test ./...` automaticamente** em projetos com testes de integração lentos; valide com `go build ./...` e `golangci-lint run` antes de finalizar.
- Migrations de banco são **imutáveis** após aplicadas — nunca edite migration existente. Mudança de schema = nova migration.

## Módulos Relacionados

Este arquivo contém as regras fundamentais do desenvolvimento Go. Para regras específicas, consulte:

- **go-api.md**: HTTP handlers, middlewares, DTOs, validação, status HTTP, logging, rate limiting, graceful shutdown
- **go-testing.md**: Testes unitários, table-driven tests, mocks, testes de integração e cobertura
- **go-checklist.md**: Checklist consolidado para verificação antes de commit
