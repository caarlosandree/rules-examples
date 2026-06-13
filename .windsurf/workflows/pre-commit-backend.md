---
description: Verificacao antes de commitar codigo backend
---

# Pre-Commit Backend

Use este workflow antes de commitar mudancas de API, dominio, persistencia, jobs, mensageria, integracoes, scripts backend ou migrations.

## 1. Escopo

- Identifique modulos alterados e contratos afetados.
- Verifique se ha mudancas de schema, payloads, permissoes, filas, jobs ou integracoes externas.
- Consulte as regras aplicaveis em `.windsurf/rules/`.

## 2. Validacao tecnica

Escolha os comandos da stack real do projeto.

### Java / Gradle

```bash
./gradlew compileJava
./gradlew checkstyleMain
./gradlew test
```

### Java / Maven

```bash
mvn test
```

### Go

```bash
gofmt -w .
go test ./...
go build ./...
```

### NestJS / Node.js

```bash
pnpm lint
pnpm test
pnpm build
```

### Python

```bash
ruff check .
python -m compileall .
pytest
```

Se testes integrais forem lentos ou exigirem servicos externos, rode a validacao minima segura e informe o que ficou pendente.

## 3. API e contratos

- [ ] Entradas validadas no boundary da API.
- [ ] Respostas usam DTOs/schemas, nao entidades internas.
- [ ] Erros retornam status e mensagens consistentes.
- [ ] Endpoints novos seguem versionamento e padrao de rotas do projeto.
- [ ] Contratos alterados foram refletidos em frontend/mobile/docs quando aplicavel.

## 4. Persistencia e migrations

- [ ] Queries parametrizadas ou APIs seguras do ORM.
- [ ] Paginacao em listas grandes.
- [ ] N+1 evitado em leituras com relacionamento.
- [ ] Transacoes na camada correta.
- [ ] Migration nova criada quando o schema mudou.
- [ ] Migration aplicada nao foi editada.

## 5. Seguranca

- [ ] Autenticacao e autorizacao aplicadas no servidor.
- [ ] Isolamento por tenant, organizacao, usuario ou escopo equivalente preservado.
- [ ] Sem secrets, tokens ou PII em codigo, logs e fixtures.
- [ ] Validacao contra BOLA/IDOR em recursos acessados por ID.
- [ ] CORS, cookies, headers e permissoes nao foram afrouxados sem justificativa.

## 6. Observabilidade e operacao

- [ ] Logs ajudam diagnostico sem vazar dados sensiveis.
- [ ] Erros externos sao tratados com timeout, retry ou fallback quando necessario.
- [ ] Jobs, filas e tarefas assicronas evitam reprocessamento infinito.
- [ ] Mudancas com impacto operacional possuem nota ou runbook quando necessario.

## 7. Commit

- Revise `git diff` antes de commitar.
- Separe commits por mudanca logica e area quando fizer sentido.
- Use Conventional Commits em pt-BR conforme `.windsurf/rules/commit.md`.
- Nao faca push sem pedido explicito.

