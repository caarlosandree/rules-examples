---
description: Execução de testes do projeto afetado
---

# Test

Execute a suite de testes quando o usuário solicitar ou antes de um push. Não rode testes lentos automaticamente sem consentimento.

## Java

```bash
./gradlew test
# ou
mvn test
```

## Go

```bash
go test ./...
```

## NestJS / NextJS / Vue / Vite / Angular

```bash
pnpm test
# ou
npm run test
```

## Python

```bash
pytest
```
