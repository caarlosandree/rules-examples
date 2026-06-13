---
trigger: always_on
description: Regras para desenvolvimento de APIs HTTP em Go: handlers, middlewares, DTOs, validação, status HTTP, logging, rate limiting e graceful shutdown.
globs: **/*.go
---
# Regras de Desenvolvimento - Go API

## Stack Tecnológica

Este documento aplica-se a APIs HTTP escritas em Go usando:
- **`net/http`** padrão (recomendado para APIs simples e controle total)
- **Gin** (`gin-gonic/gin`) — framework popular e performático
- **Echo** (`labstack/echo`) — middlewares ricos e boa ergonomia
- **Fiber** (`gofiber/fiber`) — inspirado no Express, otimizado para throughput
- **Go 1.23+**, Go Modules, `log/slog`, `go-playground/validator`

Escolha um framework por projeto e mantenha a consistência. Para bibliotecas compartilhadas, prefira `net/http`.

## Princípios Gerais

### Separação de Responsabilidades
- Handlers devem apenas: receber a requisição, validar entrada, chamar a camada de negócio e formatar a resposta
- Não coloque lógica de negócio em handlers
- Use DTOs para entrada e saída de dados
- Retorne DTOs, nunca entidades de domínio diretamente

### Contratos Explícitos
- Defina request/response DTOs com tags de serialização claras
- Valide todas as entradas antes de chamar a camada de negócio
- Documente endpoints com OpenAPI/Swagger quando aplicável
- Use status HTTP corretos e consistentes

### Resiliência
- Implemente timeout em todas as operações de I/O via `context.Context`
- Adicione middlewares de logging, recovery e rate limiting
- Prepare a aplicação para graceful shutdown
- Retorne mensagens de erro úteis, mas nunca exponha detalhes internos em produção

## Estrutura de Handlers

### Layout Padrão
```
internal/
  └── user/
      ├── handler.go        # HTTP handlers
      ├── dto.go            # Request/Response DTOs
      ├── service.go        # Lógica de negócio
      └── routes.go         # Registro de rotas
```

### Handler Idiomático
```go
// internal/user/handler.go
package user

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

// Create godoc
// @Summary      Cria um usuário
// @Description  Cria um novo usuário no sistema
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        request  body  CreateUserRequest  true  "Dados do usuário"
// @Success      201  {object}  UserResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Router       /users [post]
func (h *Handler) Create(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "dados inválidos", err)
		return
	}

	user, err := h.svc.Create(c.Request.Context(), req)
	if err != nil {
		if errors.Is(err, ErrEmailAlreadyExists) {
			respondError(c, http.StatusConflict, "e-mail já cadastrado", nil)
			return
		}
		respondError(c, http.StatusInternalServerError, "erro ao criar usuário", err)
		return
	}

	c.JSON(http.StatusCreated, toResponse(user))
}
```

### Handler com net/http
```go
// internal/user/handler.go
package user

import (
	"encoding/json"
	"errors"
	"net/http"
)

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "dados inválidos")
		return
	}

	user, err := h.svc.Create(r.Context(), req)
	if err != nil {
		if errors.Is(err, ErrEmailAlreadyExists) {
			respondError(w, http.StatusConflict, "e-mail já cadastrado")
			return
		}
		respondError(w, http.StatusInternalServerError, "erro ao criar usuário")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(toResponse(user))
}
```

## DTOs (Data Transfer Objects)

### Definição de DTOs
```go
// internal/user/dto.go
package user

import "time"

// CreateUserRequest representa a entrada para criação de usuário.
type CreateUserRequest struct {
	Name  string `json:"name"  validate:"required,min=2,max=100"`
	Email string `json:"email" validate:"required,email"`
}

// UserResponse representa a saída de um usuário.
type UserResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

// ErrorResponse representa uma resposta de erro padronizada.
type ErrorResponse struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Details map[string]string `json:"details,omitempty"`
}
```

### Conversão DTO ↔ Domínio
```go
// ✅ Bom: Converter explícito mantendo domínio desacoplado
func toResponse(u *User) UserResponse {
	return UserResponse{
		ID:        u.ID,
		Name:      u.Name,
		Email:     u.Email,
		CreatedAt: u.CreatedAt,
	}
}
```

## Validação

### Validação com go-playground/validator
```go
// internal/shared/validator/validator.go
package validator

import (
	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

// Struct valida uma struct com base nas tags.
func Struct(s any) error {
	return validate.Struct(s)
}

// ValidationErrors converte erros de validação em mapa amigável.
func ValidationErrors(err error) map[string]string {
	out := make(map[string]string)
	if verr, ok := err.(validator.ValidationErrors); ok {
		for _, fe := range verr {
			out[fe.Field()] = tagToMsg(fe)
		}
	}
	return out
}
```

### Uso no Handler
```go
if err := validator.Struct(req); err != nil {
	respondValidationError(c, err)
	return
}
```

### Regras de Validação
- Valide no handler antes de chamar o service
- Retorne erros de validação com `400 Bad Request`
- Nunca persista dados sem validar
- Use mensagens de erro claras e, quando possível, em português

## Status HTTP

Use status HTTP semanticamente corretos:

| Situação | Status |
|----------|--------|
| Sucesso genérico | `200 OK` |
| Recurso criado | `201 Created` |
| Requisição aceita para processamento assíncrono | `202 Accepted` |
| Sem conteúdo | `204 No Content` |
| Dados inválidos | `400 Bad Request` |
| Não autenticado | `401 Unauthorized` |
| Sem permissão | `403 Forbidden` |
| Recurso não encontrado | `404 Not Found` |
| Conflito (ex: e-mail duplicado) | `409 Conflict` |
| Erro inesperado no servidor | `500 Internal Server Error` |
| Serviço indisponível | `503 Service Unavailable` |

## Middlewares

### Middlewares Obrigatórios
- **Logging**: log de todas as requisições com método, path, status e duração
- **Recovery**: captura `panic` e retorna `500` sem derrubar o servidor
- **Request ID**: correlaciona logs de uma mesma requisição
- **CORS**: configurado de forma restritiva
- **Rate Limiting**: protege contra abuso
- **Autenticação/Autorização**: quando aplicável

### Exemplo de Middleware de Logging
```go
// internal/shared/middleware/logger.go
package middleware

import (
	"log/slog"
	"net/http"
	"time"
)

func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rw := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}

		next.ServeHTTP(rw, r)

		slog.Info("request",
			"method", r.Method,
			"path", r.URL.Path,
			"status", rw.statusCode,
			"duration", time.Since(start),
		)
	})
}

type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}
```

### Rate Limiting
```go
// ✅ Bom: rate limiting por IP com golang.org/x/time/rate
package middleware

import (
	"net"
	"net/http"
	"sync"

	"golang.org/x/time/rate"
)

type rateLimiter struct {
	visitors map[string]*rate.Limiter
	mu       sync.RWMutex
	r        rate.Limit
	b        int
}

func NewRateLimiter(r rate.Limit, b int) *rateLimiter {
	return &rateLimiter{visitors: make(map[string]*rate.Limiter), r: r, b: b}
}

func (rl *rateLimiter) GetLimiter(ip string) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	lim, ok := rl.visitors[ip]
	if !ok {
		lim = rate.NewLimiter(rl.r, rl.b)
		rl.visitors[ip] = lim
	}
	return lim
}

func (rl *rateLimiter) Handler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip, _, _ := net.SplitHostPort(r.RemoteAddr)
		if !rl.GetLimiter(ip).Allow() {
			http.Error(w, "too many requests", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}
```

## Respostas de Erro Padronizadas

```go
// internal/shared/response/response.go
package response

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

func Error(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"code":    code,
		"message": message,
	})
}

func ErrorWithLog(w http.ResponseWriter, status int, code, message string, err error) {
	slog.Error("http error", "code", code, "error", err)
	Error(w, status, code, message)
}

func JSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
```

### Mensagens de Erro
- Em desenvolvimento: pode incluir detalhes do erro
- Em produção: mensagens genéricas para erros internos; nunca exponha stack traces ou SQL
- Use códigos de erro internos para facilitar rastreamento

## Logging

- Use `log/slog` como padrão em projetos Go 1.21+
- Estruture logs em JSON em produção
- Inclua `request_id` em todos os logs de uma requisição
- Não logue dados sensíveis (senhas, tokens, CPF, cartão)

```go
// ✅ Bom: logging estruturado
slog.Info("usuário criado",
	"user_id", user.ID,
	"email", user.Email,
	"request_id", requestID,
)

// ❌ Ruim: log de dado sensível
slog.Info("login", "password", password)
```

## Graceful Shutdown

```go
// cmd/api/main.go
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	cfg := loadConfig()
	srv := &http.Server{
		Addr:         ":" + cfg.HTTPPort,
		Handler:      routes(),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		slog.Info("servidor iniciado", "addr", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("falha ao iniciar servidor", "error", err)
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("desligando servidor...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("erro no graceful shutdown", "error", err)
	}

	slog.Info("servidor encerrado")
}
```

## Segurança Básica

- Nunca confie em dados do cliente; valide tudo
- Use prepared statements ou ORM para evitar SQL injection
- Escape saídas quando renderizar HTML
- Configure CORS de forma restritiva, nunca `*`
- Valide e normalize headers de segurança (CSP, HSTS, X-Content-Type-Options)
- Limite tamanho de payload no servidor (`MaxHeaderBytes`, `ReadTimeout`)

## Docs Oficiais
- net/http - https://pkg.go.dev/net/http
- Gin - https://gin-gonic.com/docs/
- Echo - https://echo.labstack.com/
- Fiber - https://docs.gofiber.io/
- go-playground/validator - https://pkg.go.dev/github.com/go-playground/validator/v10

## Módulos Relacionados

- **go-core.md**: Princípios gerais, estrutura de pastas, nomenclatura, formatação e padrões idiomáticos
- **go-testing.md**: Testes unitários, mocks, testes de integração e cobertura
- **go-checklist.md**: Checklist consolidado para verificação antes de commit
