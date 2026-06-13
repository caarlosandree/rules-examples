---
description: Checagem de tipos do projeto afetado
---

# Typecheck

Use este workflow quando a mudanca afetar codigo tipado, contratos, DTOs, schemas ou configuracao de compilacao.

## 1. Identifique a area

- Frontend web: React, Next.js, Vue, Vite ou Angular.
- Mobile: React Native, Expo, Ionic ou equivalente.
- Backend TypeScript: NestJS, Node.js ou workers.
- Python: projetos com `mypy`, `pyright` ou `basedpyright`.
- Java/Go: use compilacao/testes como validacao de tipos quando nao houver comando separado.

## 2. Execute o comando canonico

### TypeScript / JavaScript

```bash
pnpm typecheck
# ou
npm run typecheck
# ou
yarn typecheck
```

Se nao existir script dedicado:

```bash
npx tsc --noEmit
```

### Angular

```bash
ng build --configuration development
```

### Python

```bash
mypy .
# ou
pyright
```

### Java

```bash
./gradlew compileJava
# ou
mvn test -DskipTests
```

### Go

```bash
go test ./...
```

## 3. Corrija erros

- Corrija a causa do erro, nao apenas a anotacao local.
- Evite `any`; prefira tipos especificos, `unknown` ou tipos inferidos de schemas.
- Use `z.infer`, DTOs, records, structs ou interfaces compartilhadas quando o projeto ja tiver esse padrao.
- Nao relaxe `strict`, `noImplicitAny`, `skipLibCheck` ou flags equivalentes para esconder erro de codigo.

## 4. Rode novamente

Depois de corrigir, rode o mesmo comando para confirmar que o typecheck ficou limpo. Se o erro for preexistente e fora do escopo, registre a evidencia e limite a mudanca ao escopo pedido.

