---
description: Verificacao antes de commitar codigo frontend
---

# Pre-Commit Frontend

Use este workflow antes de commitar mudancas de UI web, rotas, estado, chamadas HTTP, formularios, validacao, assets ou configuracao frontend.

## 1. Escopo

- Identifique rotas, componentes, hooks, services e schemas afetados.
- Confirme se ha mudanca de contrato com backend ou mobile.
- Consulte as regras frontend em `.windsurf/rules/`.

## 2. Validacao tecnica

Execute na pasta do frontend.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Alternativas conforme o projeto:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Para Vue/Vite/Angular, use os scripts equivalentes do projeto. Se `test` ou `build` forem lentos, rode lint/typecheck como minimo e informe o que ficou pendente.

## 3. Componentes e UI

- [ ] Componentes seguem o design system existente.
- [ ] Estados de loading, erro, vazio e sucesso foram tratados.
- [ ] Layout responsivo validado nos breakpoints relevantes.
- [ ] Texto nao estoura containers nem sobrepoe outros elementos.
- [ ] Acessibilidade basica revisada: labels, foco, teclado e contraste.
- [ ] Imagens/assets carregam corretamente e possuem alternativa textual quando aplicavel.

## 4. Estado, dados e formularios

- [ ] Estado remoto usa o padrao do projeto, como TanStack Query, SWR ou services dedicados.
- [ ] Cache e invalidacao tratados apos mutations.
- [ ] Formularios usam schema/validator padrao, como Zod, Yup, Valibot ou validators nativos.
- [ ] Mensagens de erro sao claras e conectadas ao campo ou fluxo correto.
- [ ] Tipos do frontend estao alinhados com DTOs ou contratos da API.

## 5. Seguranca

- [ ] Nenhum secret foi exposto no bundle.
- [ ] Variaveis publicas seguem o prefixo exigido pela stack.
- [ ] HTML rico e sanitizado antes de uso.
- [ ] Autorizacao sensivel nao depende apenas de esconder UI.
- [ ] Uploads, links externos e redirects foram validados.

## 6. Performance

- [ ] Evitou renderizacao ou fetch desnecessario.
- [ ] Componentes pesados usam memoizacao apenas quando ha ganho claro.
- [ ] Code splitting, lazy loading ou server rendering seguem o padrao do framework.
- [ ] Imagens usam otimizacao apropriada da stack quando disponivel.

## 7. Commit

- Revise `git diff` antes de commitar.
- Separe frontend de backend/mobile quando a mudanca permitir.
- Use Conventional Commits em pt-BR conforme `.windsurf/rules/commit.md`.
- Nao faca push sem pedido explicito.

