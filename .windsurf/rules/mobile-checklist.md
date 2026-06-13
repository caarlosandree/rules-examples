---
trigger: always_on
description: Checklist para alterações mobile: lint, typecheck, navegação, UI, API, segurança, performance e release.
globs: mobile/**
---

# Checklist Mobile

## Código

- [ ] TypeScript compila sem erros.
- [ ] Lint passa.
- [ ] Nomes de telas, hooks, services e tipos estão claros.
- [ ] Não há logs de debug, código morto ou arquivos temporários.

## Navegação e UX

- [ ] Fluxo funciona com back/gesture/hardware back quando aplicável.
- [ ] Loading, erro, vazio e sucesso estão tratados.
- [ ] Layout respeita safe area e teclado.
- [ ] Componentes interativos têm tamanho de toque adequado.

## API e Estado

- [ ] Chamadas HTTP passam pelo cliente central.
- [ ] Cache/invalidação está correto após mutations.
- [ ] Erros de rede e sessão expirada são tratados.

## Segurança

- [ ] Não há secrets hardcoded.
- [ ] Tokens/dados sensíveis usam storage adequado.
- [ ] Logout limpa estado e cache sensível.
- [ ] API usa HTTPS em ambientes compartilhados.

## Performance

- [ ] Listas grandes usam componente virtualizado.
- [ ] Imagens têm tamanho adequado e cache quando aplicável.
- [ ] Re-renderizações caras foram evitadas ou medidas.

## Módulos Relacionados

- `mobile-core.md`: regras fundamentais mobile.
- `security-core.md`: baseline de segurança.
- `commit.md`: padrão de commit.
