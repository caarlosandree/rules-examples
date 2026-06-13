---
description: Build do projeto afetado
---

# Build

Sempre valide o build antes de considerar uma tarefa finalizada. Adapte os comandos à stack do projeto.

## Java (Maven/Gradle)

```bash
# Gradle
./gradlew build -x test

# Maven
mvn clean package -DskipTests
```

## Go

```bash
go build ./...
```

## NestJS

```bash
npm run build
# ou
pnpm build
```

## NextJS

```bash
npm run build
# ou
pnpm build
```

## Python

```bash
# FastAPI/Django/Flask — valide importações e sintaxe
python -m compileall .
```

## Vue / Vite

```bash
npm run build
# ou
pnpm build
```

## Angular

```bash
ng build
```
