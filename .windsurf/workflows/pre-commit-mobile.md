---
description: Verificacao antes de commitar codigo mobile
---

# Pre-Commit Mobile

Use este workflow antes de commitar mudancas de React Native, Expo, Flutter, Kotlin/Swift mobile, navegacao, telas, permissoes, estado remoto ou configuracao nativa.

## 1. Escopo

- Identifique telas, navegadores, hooks, services, schemas e configuracoes nativas afetadas.
- Confirme se a mudanca exige validacao em simulador, emulador, device ou build nativo.
- Consulte regras mobile em `.windsurf/rules/` quando existirem.

## 2. Validacao tecnica

### React Native / Expo

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Alternativas:

```bash
npm run lint
npm run typecheck
npm run test
```

Quando a mudanca afetar configuracao nativa, dependencias Expo ou build:

```bash
npx expo-doctor
```

### Flutter

```bash
flutter analyze
flutter test
```

### Android nativo

```bash
./gradlew test
./gradlew assembleDebug
```

### iOS nativo

```bash
xcodebuild test -scheme <Scheme> -destination 'platform=iOS Simulator,name=<Device>'
```

Use os comandos reais do projeto e registre qualquer validacao nao executada.

## 3. UX mobile

- [ ] Fluxo funciona com toque, teclado virtual e areas seguras.
- [ ] Estados de loading, erro, vazio, offline e retry foram tratados quando aplicavel.
- [ ] Componentes seguem tema e padrao visual do app.
- [ ] Textos cabem em telas pequenas e com fontes aumentadas quando possivel.
- [ ] Navegacao preserva historico, parametros e deep links afetados.

## 4. Estado, API e persistencia local

- [ ] Estado remoto usa o padrao do projeto.
- [ ] Cache, invalidacao e retry estao coerentes com o fluxo.
- [ ] Tokens, sessoes e dados sensiveis usam storage apropriado.
- [ ] DTOs e schemas estao alinhados com backend.
- [ ] Migrações locais ou alteracoes de storage possuem compatibilidade com dados existentes.

## 5. Permissoes e nativo

- [ ] Permissoes foram declaradas nos manifests/configs corretos.
- [ ] Negacao de permissao e indisponibilidade do recurso foram tratadas.
- [ ] Dependencias nativas exigem rebuild quando necessario.
- [ ] Configuracoes de iOS/Android nao expõem secrets.

## 6. Commit

- Revise `git diff` antes de commitar.
- Separe mobile de backend/frontend quando a mudanca permitir.
- Use Conventional Commits em pt-BR conforme `.windsurf/rules/commit.md`.
- Nao faca push sem pedido explicito.
