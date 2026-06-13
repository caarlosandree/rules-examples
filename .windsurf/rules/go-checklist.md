---
trigger: always_on
description: Checklist pré-commit para projetos Go — validações obrigatórias e recomendadas antes de finalizar alterações.
globs: **/*.go
---
# Checklist Pré-Commit - Go

Execute este checklist antes de considerar uma alteração finalizada. Os itens obrigatórios devem sempre passar; os recomendados são fortemente desejáveis.

## Obrigatório

### 1. Compilação
- [ ] O projeto compila sem erros: `go build ./...`
- [ ] Todos os pacotes são resolvidos corretamente (`go mod tidy` se necessário)
- [ ] Não há imports não utilizados (`goimports` ou `gofmt`)

### 2. Formatação
- [ ] Código formatado com `gofmt`
- [ ] Imports organizados com `goimports`
- [ ] Linhas respeitam o limite de **120 caracteres**
- [ ] Não há tabs misturados com espaços (use tabs, padrão Go)

### 3. Lint
- [ ] `golangci-lint run` passa sem erros
- [ ] Não há issues de severidade alta (erro, warning relevante)
- [ ] Novos suppressões de lint são justificadas em comentário

### 4. Testes
- [ ] Testes unitários passam: `go test ./...`
- [ ] Race detector passa: `go test ./... -race`
- [ ] Novas funcionalidades possuem testes correspondentes
- [ ] Cenários de erro estão testados
- [ ] Cobertura não caiu abaixo da meta do projeto

### 5. Tratamento de Erros
- [ ] Todos os erros retornados são verificados (`if err != nil`)
- [ ] Erros recebem contexto com `fmt.Errorf("...: %w", err)`
- [ ] Não há `panic` para fluxos esperados
- [ ] Sentinel errors (`errors.Is`) são usados quando apropriado

### 6. Código Idiomático
- [ ] Interfaces são definidas pelos consumidores
- [ ] `context.Context` é propagado em operações de I/O
- [ ] Nomes seguem PascalCase (exportado) / camelCase (não exportado)
- [ ] Pacotes têm nomes curtos e descritivos em lowercase

### 7. Segurança
- [ ] Não há credenciais ou segredos hardcoded
- [ ] Dados sensíveis não são logados
- [ ] Entradas de usuário são validadas
- [ ] Queries usam prepared statements ou ORM seguro
- [ ] Headers de segurança estão configurados

### 8. API (quando aplicável)
- [ ] DTOs são usados para request/response
- [ ] Status HTTP são semanticamente corretos
- [ ] Respostas de erro seguem o formato padronizado
- [ ] Validação ocorre no handler antes do service
- [ ] Endpoints documentados no OpenAPI/Swagger (se o projeto usar)

## Recomendado

### 9. Documentação
- [ ] Funções e tipos exportados possuem comentário GoDoc
- [ ] README.md foi atualizado se necessário
- [ ] Decisões arquiteturais relevantes foram documentadas em `docs/adr/`

### 10. Commits
- [ ] Commits são atômicos e bem descritos
- [ ] Mensagem segue o padrão do projeto (`tipo: descrição`)
- [ ] Não há commits de debug ou WIP no histórico a ser enviado

### 11. Dependências
- [ ] `go.mod` e `go.sum` estão atualizados
- [ ] Novas dependências são realmente necessárias
- [ ] Licenças de novas dependências foram verificadas (quando exigido)

### 12. Performance
- [ ] Não há alocações desnecessárias em hot paths
- [ ] Concorrência segura foi verificada com `-race`
- [ ] Operações de I/O possuem timeout via `context`

### 13. Observabilidade
- [ ] Logs estruturados foram adicionados onde relevante
- [ ] Métricas/tracing foram considerados para fluxos críticos
- [ ] Erros são logados com contexto suficiente

## Comandos de Validação

```bash
# Compilação
go build ./...

# Formatação
gofmt -w .
goimports -w .

# Lint
golangci-lint run

# Testes
go test ./...
go test ./... -race

# Cobertura
go test ./... -cover

# Módulos
go mod tidy
go mod verify
```

## Scripts de Automação

Configure scripts no `Makefile` ou `package.json` do projeto para facilitar:

```makefile
.PHONY: lint test check

lint:
	golangci-lint run

fmt:
	gofmt -w .
	goimports -w .

test:
	go test ./... -race

cover:
	go test ./... -coverprofile=coverage.out
	go tool cover -html=coverage.out -o coverage.html

check: fmt lint test
	go build ./...
```

## Hooks de Pre-commit

Recomenda-se configurar `lefthook`, `husky` ou `pre-commit` para executar automaticamente:

```yaml
# lefthook.yml
pre-commit:
  commands:
    gofmt:
      glob: "*.go"
      run: gofmt -l {staged_files}
    goimports:
      glob: "*.go"
      run: goimports -l {staged_files}
    lint:
      glob: "*.go"
      run: golangci-lint run
    test:
      glob: "*_test.go"
      run: go test ./...
```

## Pós-Checklist

Após todos os itens obrigatórios estarem marcados:
- Faça um último `git diff --check` para verificar whitespace
- Revise seu próprio PR antes de solicitar review
- Garanta que a pipeline CI/CD passará com as alterações

## Módulos Relacionados

- **go-core.md**: Princípios gerais, estrutura de pastas e padrões idiomáticos
- **go-api.md**: APIs HTTP, handlers, middlewares, DTOs e logging
- **go-testing.md**: Testes unitários, mocks, testes de integração e cobertura
