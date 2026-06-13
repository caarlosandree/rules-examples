---
description: Lint e formatação do projeto afetado
---

# Lint

Execute linting e formatação antes de commitar. Corrija todos os erros reportados.

## Java

```bash
./gradlew checkstyleMain
# ou
mvn checkstyle:check
```

## Go

```bash
gofmt -w .
golangci-lint run
```

## NestJS / NextJS / Vue / Vite / Angular

```bash
pnpm lint
# ou
npm run lint
```

## Python

```bash
ruff check .
ruff format .
# ou
black .
flake8 .
```
